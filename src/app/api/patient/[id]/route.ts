import { NextResponse } from 'next/server';
import { PrismaClient, MetricType, DataSource, ActivityLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Caché simple en memoria (para demo; en producción usar Redis)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 segundos

// Tipos para respuesta tipada
interface PatientProfile {
  age: number | null;
  height: number | null;
  targetWeight: number | null;
  activityLevel: ActivityLevel | null;
}

interface CompositionRecord {
  weight: number;
  smm: number;
  pbf: number;
  bodyFatMass: number;
  totalBodyWater: number;
  protein: number;
  minerals: number;
  bmr: number;
  vfl: number;
  phaseAngle: number;
  waistHipRatio: number | null;
  date: Date;
  source: DataSource | null;
}

interface BiometricSnapshot {
  id: string;
  patientId: string;
  bpm: number | null;
  hrv: number | null;
  hrvStatus: string | null;
  spo2: number | null;
  temperature: number | null;
  skinTemp: number | null;
  steps: number | null;
  calories: number | null;
  activeMinutes: number | null;
  sleepScore: number | null;
  recoveryScore: number | null;
  stressLevel: number | null;
  recordedAt: Date;
  source: DataSource | null;
  deviceId: string | null;
  isSynced: boolean;
}

interface DiveMetric {
  id: string;
  type: MetricType;
  value: number;
  unit: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  metadata: Record<string, any> | null;
  location: Record<string, any> | null;
  source: DataSource;
  deviceId: string | null;
  isProcessed: boolean;
  hasAlert: boolean;
}

interface SystemEventSummary {
  id: string;
  type: string;
  severity: string;
  title: string;
  isRead: boolean;
  createdAt: Date;
}

interface PatientResponse {
  id: string;
  name: string | null;
  email: string | null;
  profile: PatientProfile;
  compositions: CompositionRecord[];
  biometrics: BiometricSnapshot[];
  metrics: DiveMetric[];
  recentEvents: SystemEventSummary[];
  lastChatAt: Date | null;
  lastProcessedAt: Date | null;
  meta: {
    lastSync: string;
    responseTimeMs: number;
    cacheStatus: 'HIT' | 'MISS' | 'STALE';
    dataQuality: {
      compositionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
      biometricRecency: 'REALTIME' | 'RECENT' | 'STALE';
      diveDataAvailable: boolean;
      pendingEvents: number;
    };
  };
}

// Mapeo de confianza por fuente de composición
const getCompositionConfidence = (source: DataSource | null): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (!source) return 'LOW';
  if ([DataSource.INBODY_970, DataSource.INBODY_770, DataSource.LAB_ANALYSIS].includes(source)) {
    return 'HIGH';
  }
  if ([DataSource.INBODY_270, DataSource.BIA_MULTIFRECUENCIA, DataSource.BIA_SEGMENTAL].includes(source)) {
    return 'MEDIUM';
  }
  return 'LOW';
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;
  
  // 1. CACHE CHECK
  const cacheKey = `patient:${id}:full`;
  const cached = cache.get(cacheKey);
  const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
  const isCacheValid = cacheAge < CACHE_TTL;
  
  if (cached && isCacheValid) {
    console.log(`[CACHE_HIT]: ${id} (${Date.now() - startTime}ms)`);
    return NextResponse.json(cached.data, {
      headers: { 
        'X-Cache': 'HIT',
        'X-Cache-Age': `${Math.round(cacheAge / 1000)}s`
      }
    });
  }

  try {
    // 2. QUERY OPTIMIZADA PARA SISTEMA CURIE v2.2
    const [
      patient,
      recentBiometrics,
      recentDives,
      compositions,
      latestComposition,
      recentEvents
    ] = await Promise.all([
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
          targetWeight: true,
          activityLevel: true,
          lastChatAt: true,
          lastProcessedAt: true
        }
      }),
      
      // Historial reciente de biométricos (últimas 24h para tendencias)
      prisma.biometricSnapshot.findMany({
        where: { 
          patientId: id,
          recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        orderBy: { recordedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          patientId: true,
          bpm: true,
          hrv: true,
          hrvStatus: true,
          spo2: true,
          temperature: true,
          skinTemp: true,
          steps: true,
          calories: true,
          activeMinutes: true,
          sleepScore: true,
          recoveryScore: true,
          stressLevel: true,
          recordedAt: true,
          source: true,
          deviceId: true,
          isSynced: true
        }
      }),
      
      // Métricas de BUCEO con metadatos completos
      prisma.metricLog.findMany({
        where: { 
          patientId: id,
          type: { 
            in: [
              MetricType.DEPTH, 
              MetricType.WATER_TEMPERATURE, 
              MetricType.DECO_STOP,
              MetricType.DIVE_TIME,
              MetricType.ASCENT_RATE,
              MetricType.SURFACE_INTERVAL,
              MetricType.GAS_MIX
            ] 
          }
        },
        orderBy: { startedAt: 'desc' },
        take: 15,
        select: {
          id: true,
          type: true,
          value: true,
          unit: true,
          startedAt: true,
          endedAt: true,
          duration: true,
          metadata: true,
          location: true,
          source: true,
          deviceId: true,
          isProcessed: true,
          hasAlert: true
        }
      }),
      
      // Últimas 5 composiciones para análisis de tendencias
      prisma.compositionRecord.findMany({
        where: { patientId: id },
        orderBy: { date: 'desc' },
        take: 5,
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
      }),
      
      // Composición más reciente marcada explícitamente
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
      }),

      // Eventos de sistema recientes no leídos
      prisma.systemEvent.findMany({
        where: { 
          patientId: id,
          isRead: false,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Últimos 7 días
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          severity: true,
          title: true,
          isRead: true,
          createdAt: true
        }
      })
    ]);

    if (!patient) {
      return NextResponse.json({ 
        error: "PATIENT_NOT_FOUND",
        code: "PATIENT_001",
        message: `Paciente ${id} no encontrado en Nexus`
      }, { status: 404 });
    }

    // 3. CALCULAR CALIDAD DE DATOS
    const now = Date.now();
    const latestBiometric = recentBiometrics[0];
    
    const biometricRecency = latestBiometric?.recordedAt 
      ? (now - new Date(latestBiometric.recordedAt).getTime()) < 5 * 60 * 1000
        ? 'REALTIME'
        : (now - new Date(latestBiometric.recordedAt).getTime()) < 60 * 60 * 1000
          ? 'RECENT'
          : 'STALE'
      : 'STALE';

    const compositionConfidence = getCompositionConfidence(latestComposition?.source || null);

    // 4. CONSTRUIR RESPUESTA ENRIQUECIDA v2.2
    const responseData: PatientResponse = {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      
      profile: {
        age: patient.age,
        height: patient.height,
        targetWeight: patient.targetWeight,
        activityLevel: patient.activityLevel
      },
      
      compositions: compositions,
      biometrics: recentBiometrics,
      metrics: recentDives,
      
      recentEvents: recentEvents.map(event => ({
        ...event,
        // Asegurar serialización correcta de enums
        type: event.type.toString(),
        severity: event.severity.toString()
      })),
      
      lastChatAt: patient.lastChatAt,
      lastProcessedAt: patient.lastProcessedAt,
      
      meta: {
        lastSync: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        cacheStatus: 'MISS',
        dataQuality: {
          compositionConfidence,
          biometricRecency,
          diveDataAvailable: recentDives.length > 0,
          pendingEvents: recentEvents.length
        }
      }
    };

    // 5. GUARDAR EN CACHÉ
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Limpiar caché antigua si crece demasiado (simple LRU)
    if (cache.size > 100) {
      const oldestKey = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      cache.delete(oldestKey);
    }

    console.log(`[DB_QUERY]: ${id} | ${compositions.length} comps | ${recentDives.length} dives | ${recentEvents.length} events | (${Date.now() - startTime}ms)`);

    return NextResponse.json(responseData, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Data-Quality': `${compositionConfidence}-${biometricRecency}`,
        'X-Pending-Events': `${recentEvents.length}`
      }
    });

  } catch (error: any) {
    console.error("[NEXUS_FETCH_ERROR]:", {
      patientId: id,
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    
    // Fallback a caché stale si existe
    if (cached) {
      console.log(`[CACHE_FALLBACK]: Sirviendo datos stale para ${id} (${Math.round(cacheAge / 1000)}s old)`);
      
      const staleData = {
        ...cached.data,
        meta: {
          ...cached.data.meta,
          cacheStatus: 'STALE',
          staleWarning: `Datos de ${Math.round(cacheAge / 1000)}s atrás`
        }
      };
      
      return NextResponse.json(staleData, {
        headers: { 
          'X-Cache': 'STALE',
          'X-Stale-Age': `${Math.round(cacheAge / 1000)}s`
        }
      });
    }
    
    return NextResponse.json({ 
      error: "NEXUS_DATABASE_OFFLINE",
      code: "DB_500",
      message: "Core de datos temporalmente no disponible",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}