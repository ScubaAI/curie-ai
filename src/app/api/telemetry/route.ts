import { NextResponse } from 'next/server';
import { PrismaClient, MetricType } from '@prisma/client';
import { z } from 'zod'; // Validación estricta
import { DiveMapper } from '@/lib/mappers/diveMapper';

// Prisma singleton (NO desconectar en serverless)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Rate limiting simple (en producción usar Redis)
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;

// Esquemas de validación Zod (seguridad estricta)
const CompositionSchema = z.object({
  weight: z.number().min(30).max(300),
  smm: z.number().min(10).max(100),
  pbf: z.number().min(1).max(70),
  bodyFatMass: z.number().min(1).max(100),
  totalBodyWater: z.number().min(10).max(100).optional(),
  protein: z.number().min(1).max(50).optional(),
  minerals: z.number().min(0.5).max(10).optional(),
  bmr: z.number().min(800).max(5000).optional(),
  vfl: z.number().int().min(1).max(30),
  phaseAngle: z.number().min(3).max(15),
  waistHipRatio: z.number().min(0.5).max(1.5).optional(),
  source: z.string().max(50).optional()
});

const BiometricSchema = z.object({
  bpm: z.number().int().min(30).max(250),
  hrv: z.number().int().min(10).max(300),
  spo2: z.number().int().min(70).max(100),
  temp: z.number().min(30).max(45).optional(),
  status: z.enum(['normal', 'exercising', 'sleeping', 'stressed']).optional()
});

const DiveSchema = z.object({
  diveNumber: z.number().int(),
  maxDepth: z.number(),
  duration: z.number(),
  waterTemp: z.number().optional(),
  decompressionViolated: z.boolean().optional(),
  safetyStop: z.boolean().optional()
});

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // 1. RATE LIMITING (anti-spam)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastRequest = rateLimit.get(clientIp) || 0;
    
    if (now - lastRequest < RATE_LIMIT_WINDOW / MAX_REQUESTS) {
      return NextResponse.json({ 
        error: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW / MAX_REQUESTS) / 1000)
      }, { status: 429 });
    }
    rateLimit.set(clientIp, now);

    // 2. AUTENTICACIÓN FUERTE
    const authHeader = req.headers.get('x-nexus-secret');
    const deviceId = req.headers.get('x-device-id') || 'unknown';
    
    if (authHeader !== process.env.TELEMETRY_SECRET) {
      console.warn(`[SECURITY_ALERT:${requestId}] Acceso no autorizado desde ${clientIp}, dispositivo: ${deviceId}`);
      return NextResponse.json({ error: "UNAUTHORIZED_LINK" }, { status: 401 });
    }

    // 3. PARSE Y VALIDACIÓN DEL BODY
    let event;
    try {
      event = await req.json();
    } catch {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    const { type, data, patientEmail, timestamp } = event;

    if (!type || !data || !patientEmail) {
      return NextResponse.json({ 
        error: "MISSING_FIELDS",
        required: ["type", "data", "patientEmail"]
      }, { status: 400 });
    }

    // 4. PROCESAMIENTO ATÓMICO CON VALIDACIÓN
    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({
        where: { email: patientEmail },
        select: { id: true, name: true } // Solo lo necesario
      });

      if (!patient) {
        throw new Error(`PATIENT_NOT_FOUND: ${patientEmail}`);
      }

      const recordedAt = timestamp ? new Date(timestamp) : new Date();

      switch (type) {
        case 'COMPOSITION': {
          // VALIDACIÓN ESTRICTA
          const validated = CompositionSchema.parse(data);
          
          // Archivar anterior
          await tx.compositionRecord.updateMany({
            where: { patientId: patient.id, isLatest: true },
            data: { isLatest: false }
          });
          
          // Crear nuevo registro
          const record = await tx.compositionRecord.create({
            data: {
              patientId: patient.id,
              ...validated,
              date: recordedAt,
              isLatest: true
            }
          });
          
          // Log de auditoría
          console.log(`[COMPOSITION:${requestId}] ${patient.name}: ${validated.weight}kg, SMM ${validated.smm}kg`);
          
          return { type: 'COMPOSITION', id: record.id, weight: validated.weight };
        }

        case 'DIVE': {
          const validated = DiveSchema.parse(data);
          const diveMetrics = DiveMapper.mapDiveToMetrics(patient.id, validated);
          
          const result = await tx.metricLog.createMany({
            data: diveMetrics.map(m => ({
              ...m,
              createdAt: recordedAt,
              metadata: { ...m.metadata, requestId, deviceId }
            }))
          });
          
          console.log(`[DIVE:${requestId}] ${patient.name}: ${validated.maxDepth}m, ${result.count} métricas`);
          
          return { type: 'DIVE', metricsCreated: result.count, maxDepth: validated.maxDepth };
        }

        case 'BIOMETRIC': {
          const validated = BiometricSchema.parse(data);
          
          // GUARDAR HISTORICO (no upsert) — schema modificado
          const record = await tx.biometricSnapshot.create({
            data: {
              patientId: patient.id,
              bpm: validated.bpm,
              hrv: validated.hrv,
              spo2: validated.spo2,
              temp: validated.temp,
              status: validated.status || 'normal',
              recordedAt
            }
          });
          
          // Alerta si valores críticos
          if (validated.bpm > 200 || validated.spo2 < 85) {
            console.warn(`[CRITICAL_VITALS:${requestId}] ${patient.name}: BPM ${validated.bpm}, SpO2 ${validated.spo2}`);
          }
          
          return { type: 'BIOMETRIC', id: record.id, bpm: validated.bpm };
        }

        case 'GLUCOSE_CGM': {
          const glucoseSchema = z.object({
            glucoseMgDl: z.number().min(30).max(600),
            trendArrow: z.enum(['up', 'down', 'stable']).optional()
          });
          
          const validated = glucoseSchema.parse(data);
          
          const record = await tx.metricLog.create({
            data: {
              patientId: patient.id,
              type: MetricType.BLOOD_GLUCOSE,
              value: validated.glucoseMgDl,
              unit: 'mg/dL',
              metadata: { trendArrow: validated.trendArrow, requestId, deviceId },
              createdAt: recordedAt
            }
          });
          
          // Alerta hipoglucemia/hiperglucemia
          if (validated.glucoseMgDl < 70 || validated.glucoseMgDl > 250) {
            console.warn(`[CRITICAL_GLUCOSE:${requestId}] ${patient.name}: ${validated.glucoseMgDl} mg/dL`);
          }
          
          return { type: 'GLUCOSE_CGM', id: record.id, glucose: validated.glucoseMgDl };
        }

        default:
          throw new Error(`INVALID_EVENT_TYPE: ${type}`);
      }
    });

    const duration = Date.now() - startTime;
    console.log(`[NEXUS_SYNC:${requestId}] ${type} OK en ${duration}ms`);

    return NextResponse.json({ 
      status: "SUCCESS",
      requestId,
      processedAt: new Date().toISOString(),
      durationMs: duration,
      result
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Errores de validación Zod
    if (error.name === 'ZodError') {
      console.error(`[VALIDATION_ERROR:${requestId}]`, error.errors);
      return NextResponse.json({ 
        error: "VALIDATION_FAILED",
        requestId,
        details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }
    
    console.error(`[TELEMETRY_CRASH:${requestId}]`, error.message, `${duration}ms`);
    
    return NextResponse.json({ 
      error: "INTERNAL_CORE_FAILURE",
      requestId,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Contact support'
    }, { status: 500 });
  }
  // NOTA: NO hacemos prisma.$disconnect() — mantiene conexión pool abierta
}