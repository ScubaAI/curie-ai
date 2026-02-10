import { NextResponse } from 'next/server';
import { PrismaClient, DocumentType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema para subida de documentos (usado por panel Dr)
const UploadSchema = z.object({
  patientId: z.string(),
  type: z.enum(['NUTRITION', 'WORKOUT', 'PRESCRIPTION', 'LAB_RESULT', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  fileUrl: z.string().url(), // URL del storage (S3, Cloudflare R2, etc.)
  fileSize: z.string(),
  checksum: z.string().optional(),
  prescribedBy: z.string().optional(), // Para recetas
  validUntil: z.string().datetime().optional(), // Para recetas
});

// GET - Descargar/Ver documento (Abraham o Dr autorizado)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // 1. Buscar documento en DB
    const document = await prisma.protocolDocument.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'DOCUMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 2. Verificar acceso (en producción: sesión del usuario)
    // Por ahora: permitir acceso si es el paciente correcto
    // TODO: Añadir autenticación real con JWT o session
    
    // 3. Registrar acceso (auditoría)
    await prisma.documentAccessLog.create({
      data: {
        documentId: id,
        patientId: document.patientId,
        accessedAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // 4. Actualizar lastAccessed
    await prisma.protocolDocument.update({
      where: { id },
      data: { lastAccessed: new Date() }
    });

    // 5. Retornar metadatos + URL firmada (o redirección)
    // En producción: generar URL firmada de S3/R2 con expiración
    return NextResponse.json({
      status: 'SUCCESS',
      document: {
        id: document.id,
        title: document.title,
        description: document.description,
        type: document.type,
        fileUrl: document.fileUrl, // En prod: URL firmada temporal
        fileSize: document.fileSize,
        version: document.version,
        updatedAt: document.updatedAt,
        checksum: document.checksum,
        patientName: document.patient.name
      },
      // Si es receta, incluir info adicional
      prescription: document.type === 'PRESCRIPTION' ? {
        prescribedBy: document.prescribedBy,
        validUntil: document.validUntil
      } : null
    });

  } catch (error: any) {
    console.error('[DOCUMENT_GET_ERROR]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Subir nuevo documento (Panel Dr/Nutri)
export async function POST(request: Request) {
  try {
    // 1. Autenticación (en prod: verificar rol de doctor/nutri)
    const authHeader = request.headers.get('x-doctor-secret');
    if (authHeader !== process.env.DOCTOR_PANEL_SECRET) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse y validar body
    const body = await request.json();
    const validated = UploadSchema.parse(body);

    // 3. Verificar que paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: validated.patientId },
      select: { id: true, name: true }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 4. Si es receta, crear también en tabla Prescription
    let prescriptionId: string | null = null;
    
    if (validated.type === 'PRESCRIPTION') {
      const prescription = await prisma.prescription.create({
        data: {
          patientId: validated.patientId,
          medication: validated.title, // O parsear de descripción
          dosage: validated.description?.split('Dosaje:')[1]?.split('\n')[0]?.trim() || 'Ver documento',
          frequency: validated.description?.split('Frecuencia:')[1]?.split('\n')[0]?.trim() || 'Ver documento',
          prescribedBy: validated.prescribedBy || 'Médico',
          prescribedAt: new Date(),
          validUntil: validated.validUntil ? new Date(validated.validUntil) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          notes: validated.description,
          isActive: true,
          documentUrl: validated.fileUrl
        }
      });
      prescriptionId = prescription.id;
    }

    // 5. Crear documento en ProtocolDocument
    // Si es nueva versión, archivar la anterior
    if (validated.type === 'NUTRITION' || validated.type === 'WORKOUT') {
      await prisma.protocolDocument.updateMany({
        where: {
          patientId: validated.patientId,
          type: validated.type,
          isLatest: true
        },
        data: { isLatest: false }
      });
    }

    const document = await prisma.protocolDocument.create({
      data: {
        patientId: validated.patientId,
        type: validated.type as DocumentType,
        title: validated.title,
        description: validated.description,
        fileUrl: validated.fileUrl,
        fileSize: validated.fileSize,
        checksum: validated.checksum,
        prescribedBy: validated.prescribedBy,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
        isLatest: true,
        version: await getNextVersion(validated.patientId, validated.type)
      }
    });

    // 6. Crear notificación/evento para el paciente
    await prisma.systemEvent.create({
      data: {
        patientId: validated.patientId,
        type: 'NEW_DATA_AVAILABLE',
        severity: 'INFO',
        title: `Nuevo documento: ${validated.title}`,
        description: `Tu ${validated.type.toLowerCase()} ha sido actualizado por ${validated.prescribedBy || 'tu especialista'}`,
        isRead: false,
        isProcessed: false
      }
    });

    return NextResponse.json({
      status: 'SUCCESS',
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        version: document.version
      },
      prescriptionId
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'VALIDATION_FAILED', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('[DOCUMENT_POST_ERROR]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}

// Helper para versionado automático
async function getNextVersion(patientId: string, type: DocumentType): Promise<string> {
  const latest = await prisma.protocolDocument.findFirst({
    where: { patientId, type: type as DocumentType },
    orderBy: { createdAt: 'desc' },
    select: { version: true }
  });

  if (!latest?.version) return '1.0';

  const [major, minor] = latest.version.split('.').map(Number);
  return `${major}.${minor + 1}`;
}
