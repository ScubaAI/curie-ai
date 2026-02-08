import { NextResponse } from 'next/server';
import { PrismaClient, MetricType } from '@prisma/client';

const prisma = new PrismaClient();

// Caché simple en memoria (para demo; en producción usar Redis)
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 segundos

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;
  
  // 1. CACHE CHECK
  const cacheKey = `patient:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE_HIT]: ${id} (${Date.now() - startTime}ms)`);
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  try {
    // 2. QUERY OPTIMIZADA (Solo lo necesario)
    const [patient, latestBiometrics, recentDives, latestComposition] = await Promise.all([
      // Info básica del paciente
      prisma.patient.findFirst({
        where: {
          OR: [{ id }, { email: "abraham@visionaryai.lat" }]
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          height: true,
          targetWeight: true
        }
      }),
      
      // ÚLTIMO snapshot biométrico (no todos)
      prisma.biometricSnapshot.findFirst({
        where: { patientId: id },
        orderBy: { recordedAt: 'desc' },
        take: 1
      }),
      
      // Solo métricas de BUCEO (filtradas, no todas)
      prisma.metricLog.findMany({
        where: { 
          patientId: id,
          type: { in: [MetricType.DEPTH, MetricType.WATER_TEMPERATURE, MetricType.DECO_STOP] }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Última composición con TODOS los campos nuevos
      prisma.compositionRecord.findFirst({
        where: { patientId: id, isLatest: true },
        select: {
          weight: true,
          smm: true,
          pbf: true,
          bodyFatMass: true,
          totalBodyWater: true,
          protein: true,
          minerals: true,
          bmr: true,
          vfl: true,
          phaseAngle: true,
          waistHipRatio: true,
          date: true,
          source: true
        }
      })
    ]);

    if (!patient) {
      return NextResponse.json({ error: "PATIENT_NOT_SYNCED" }, { status: 404 });
    }

    // 3. CONSTRUIR RESPUESTA ENRIQUECIDA
    const responseData = {
      // Perfil
      id: patient.id,
      name: patient.name,
      email: patient.email,
      profile: {
        age: patient.age,
        height: patient.height,
        targetWeight: patient.targetWeight
      },
      
      // Snapshot actual (tiempo real)
      biometrics: latestBiometrics || null,
      
      // Composición corporal completa
      composition: latestComposition || null,
      
      // Historial de buceo
      diveLogs: recentDives,
      
      // Metadatos de la respuesta
      meta: {
        lastSync: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        cacheStatus: 'MISS'
      }
    };

    // 4. GUARDAR EN CACHÉ
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    console.log(`[DB_QUERY]: ${id} (${Date.now() - startTime}ms)`);

    return NextResponse.json(responseData, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });

  } catch (error: any) {
    console.error("[PATIENT_FETCH_ERROR]:", error.message, error.stack);
    
    // Fallback a caché stale si existe (mejor datos viejos que error)
    if (cached) {
      console.log(`[CACHE_FALLBACK]: Sirviendo datos stale para ${id}`);
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'STALE' }
      });
    }
    
    return NextResponse.json({ 
      error: "CORE_DATABASE_OFFLINE",
      message: error.message 
    }, { status: 500 });
  }
}