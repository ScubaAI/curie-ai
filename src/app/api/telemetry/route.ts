import { NextResponse } from 'next/server';
import { PrismaClient, MetricType, DataSource, EventType, EventSeverity } from '@prisma/client';
import { z } from 'zod';

// Prisma singleton (NO desconectar en serverless)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Rate limiting simple (en producción usar Redis)
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;

// Esquemas de validación Zod actualizados para schema v2.2
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
  source: z.nativeEnum(DataSource).optional(),
  notes: z.string().max(500).optional()
});

const BiometricSchema = z.object({
  bpm: z.number().int().min(30).max(250),
  hrv: z.number().min(10).max(300).optional(),
  hrvStatus: z.enum(['balanced', 'unbalanced', 'stressed']).optional(),
  spo2: z.number().min(70).max(100).optional(),
  temperature: z.number().min(30).max(45).optional(),
  skinTemp: z.number().min(25).max(45).optional(),
  steps: z.number().int().min(0).optional(),
  calories: z.number().int().min(0).optional(),
  activeMinutes: z.number().int().min(0).optional(),
  sleepScore: z.number().int().min(0).max(100).optional(),
  recoveryScore: z.number().int().min(0).max(100).optional(),
  stressLevel: z.number().int().min(0).max(100).optional(),
  source: z.nativeEnum(DataSource),
  deviceId: z.string().max(100).optional()
});

const DiveSchema = z.object({
  diveNumber: z.number().int(),
  maxDepth: z.number(),
  duration: z.number().int(), // segundos
  waterTemp: z.number().optional(),
  decompressionViolated: z.boolean().optional(),
  safetyStop: z.boolean().optional(),
  gasMix: z.string().optional(), // "32%", "Air", etc.
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    site: z.string().optional()
  }).optional(),
  source: z.nativeEnum(DataSource),
  deviceId: z.string().max(100).optional()
});

const GlucoseSchema = z.object({
  glucoseMgDl: z.number().min(30).max(600),
  trendArrow: z.enum(['up', 'down', 'stable']).optional()
});

// Helper para crear eventos de sistema
async function createSystemEvent(
  tx: any,
  patientId: string,
  type: EventType,
  severity: EventSeverity,
  title: string,
  description: string,
  data?: any
) {
  return tx.systemEvent.create({
    data: {
      patientId,
      type,
      severity,
      title,
      description,
      data: data || {},
      isRead: false,
      isProcessed: false,
      expiresAt: severity === EventSeverity.CRITICAL ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
}

// Helper para detectar anomalías y crear alertas
async function checkAndCreateAlerts(
  tx: any,
  patientId: string,
  type: string,
  validatedData: any
) {
  const alerts = [];

  // Alertas de composición
  if (type === 'COMPOSITION') {
    if (validatedData.pbf > 25) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.BODY_FAT_THRESHOLD, EventSeverity.WARNING,
        'Grasa corporal elevada',
        `PBF registrado: ${validatedData.pbf}%`,
        { pbf: validatedData.pbf, threshold: 25 }
      ));
    }
    if (validatedData.phaseAngle < 6) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.NEW_DATA_AVAILABLE, EventSeverity.WARNING,
        'Ángulo de fase bajo',
        `Phase Angle: ${validatedData.phaseAngle}° - Posible riesgo de catabolismo`,
        { phaseAngle: validatedData.phaseAngle }
      ));
    }
  }

  // Alertas de biométricos
  if (type === 'BIOMETRIC') {
    if (validatedData.bpm > 180) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.HEART_RATE_ANOMALY, EventSeverity.WARNING,
        'Frecuencia cardíaca elevada',
        `BPM: ${validatedData.bpm} durante reposo/actividad`,
        { bpm: validatedData.bpm }
      ));
    }
    if (validatedData.spo2 && validatedData.spo2 < 90) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.HEART_RATE_ANOMALY, EventSeverity.CRITICAL,
        'Oxigenación crítica',
        `SpO2: ${validatedData.spo2}%`,
        { spo2: validatedData.spo2 }
      ));
    }
  }

  // Alertas de buceo
  if (type === 'DIVE' && validatedData.decompressionViolated) {
    alerts.push(createSystemEvent(
      tx, patientId, EventType.DECO_VIOLATION, EventSeverity.CRITICAL,
      'Violación de descompresión',
      `Parada omitida a ${validatedData.maxDepth}m - Riesgo de EAGE`,
      { maxDepth: validatedData.maxDepth, diveNumber: validatedData.diveNumber }
    ));
  }

  // Alertas de glucosa
  if (type === 'GLUCOSE_CGM') {
    if (validatedData.glucoseMgDl < 70) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.NEW_DATA_AVAILABLE, EventSeverity.CRITICAL,
        'Hipoglucemia detectada',
        `Glucosa: ${validatedData.glucoseMgDl} mg/dL`,
        { glucose: validatedData.glucoseMgDl }
      ));
    } else if (validatedData.glucoseMgDl > 250) {
      alerts.push(createSystemEvent(
        tx, patientId, EventType.NEW_DATA_AVAILABLE, EventSeverity.WARNING,
        'Hiperglucemia detectada',
        `Glucosa: ${validatedData.glucoseMgDl} mg/dL`,
        { glucose: validatedData.glucoseMgDl }
      ));
    }
  }

  await Promise.all(alerts);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // 1. RATE LIMITING
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

    // 2. AUTENTICACIÓN
    const authHeader = req.headers.get('x-nexus-secret');
    const deviceId = req.headers.get('x-device-id') || 'unknown';
    
    if (authHeader !== process.env.TELEMETRY_SECRET) {
      console.warn(`[SECURITY_ALERT:${requestId}] Acceso no autorizado desde ${clientIp}, dispositivo: ${deviceId}`);
      return NextResponse.json({ error: "UNAUTHORIZED_LINK" }, { status: 401 });
    }

    // 3. PARSE Y VALIDACIÓN
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

    // 4. PROCESAMIENTO ATÓMICO
    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({
        where: { email: patientEmail },
        select: { id: true, name: true }
      });

      if (!patient) {
        throw new Error(`PATIENT_NOT_FOUND: ${patientEmail}`);
      }

      const recordedAt = timestamp ? new Date(timestamp) : new Date();

      switch (type) {
        case 'COMPOSITION': {
          const validated = CompositionSchema.parse(data);
          
          // Archivar anterior
          await tx.compositionRecord.updateMany({
            where: { patientId: patient.id, isLatest: true },
            data: { isLatest: false }
          });
          
          // Crear nuevo
          const record = await tx.compositionRecord.create({
            data: {
              patientId: patient.id,
              weight: validated.weight,
              smm: validated.smm,
              pbf: validated.pbf,
              bodyFatMass: validated.bodyFatMass,
              totalBodyWater: validated.totalBodyWater ?? 0,
              protein: validated.protein ?? 0,
              minerals: validated.minerals ?? 0,
              bmr: validated.bmr ?? 0,
              vfl: validated.vfl,
              phaseAngle: validated.phaseAngle,
              waistHipRatio: validated.waistHipRatio,
              source: validated.source ?? DataSource.MANUAL_ENTRY,
              notes: validated.notes,
              date: recordedAt,
              isLatest: true
            }
          });
          
          // Crear alertas si aplica
          await checkAndCreateAlerts(tx, patient.id, type, validated);
          
          // Actualizar lastProcessedAt
          await tx.patient.update({
            where: { id: patient.id },
            data: { lastProcessedAt: new Date() }
          });
          
          console.log(`[COMPOSITION:${requestId}] ${patient.name}: ${validated.weight}kg, SMM ${validated.smm}kg`);
          
          return { type: 'COMPOSITION', id: record.id, weight: validated.weight };
        }

        case 'DIVE': {
          const validated = DiveSchema.parse(data);
          
          // Crear múltiples métricas de buceo
          const diveMetrics = [
            {
              patientId: patient.id,
              type: MetricType.DEPTH,
              value: validated.maxDepth,
              unit: 'meters',
              startedAt: recordedAt,
              endedAt: new Date(recordedAt.getTime() + validated.duration * 1000),
              duration: validated.duration,
              metadata: {
                decompressionViolated: validated.decompressionViolated || false,
                safetyStop: validated.safetyStop || false,
                gasMix: validated.gasMix || 'Air',
                diveNumber: validated.diveNumber,
                waterTemp: validated.waterTemp
              },
              location: validated.location || null,
              source: validated.source,
              deviceId: validated.deviceId || deviceId,
              isProcessed: false,
              hasAlert: validated.decompressionViolated || false
            },
            {
              patientId: patient.id,
              type: MetricType.DIVE_TIME,
              value: validated.duration,
              unit: 'seconds',
              startedAt: recordedAt,
              endedAt: new Date(recordedAt.getTime() + validated.duration * 1000),
              duration: validated.duration,
              metadata: { diveNumber: validated.diveNumber },
              source: validated.source,
              deviceId: validated.deviceId || deviceId,
              isProcessed: false,
              hasAlert: false
            }
          ];

          if (validated.waterTemp) {
            diveMetrics.push({
              patientId: patient.id,
              type: MetricType.WATER_TEMPERATURE,
              value: validated.waterTemp,
              unit: 'celsius',
              startedAt: recordedAt,
              endedAt: new Date(recordedAt.getTime() + validated.duration * 1000),
              duration: validated.duration,
              metadata: { diveNumber: validated.diveNumber },
              source: validated.source,
              deviceId: validated.deviceId || deviceId,
              isProcessed: false,
              hasAlert: false
            });
          }

          const createdMetrics = await Promise.all(
            diveMetrics.map(m => tx.metricLog.create({ data: m }))
          );
          
          // Crear alertas si aplica
          await checkAndCreateAlerts(tx, patient.id, type, validated);
          
          // Actualizar lastProcessedAt
          await tx.patient.update({
            where: { id: patient.id },
            data: { lastProcessedAt: new Date() }
          });
          
          console.log(`[DIVE:${requestId}] ${patient.name}: ${validated.maxDepth}m, ${createdMetrics.length} métricas`);
          
          return { type: 'DIVE', metricsCreated: createdMetrics.length, maxDepth: validated.maxDepth };
        }

        case 'BIOMETRIC': {
          const validated = BiometricSchema.parse(data);
          
          const record = await tx.biometricSnapshot.create({
            data: {
              patientId: patient.id,
              bpm: validated.bpm,
              hrv: validated.hrv,
              hrvStatus: validated.hrvStatus,
              spo2: validated.spo2,
              temperature: validated.temperature,
              skinTemp: validated.skinTemp,
              steps: validated.steps,
              calories: validated.calories,
              activeMinutes: validated.activeMinutes,
              sleepScore: validated.sleepScore,
              recoveryScore: validated.recoveryScore,
              stressLevel: validated.stressLevel,
              recordedAt,
              source: validated.source,
              deviceId: validated.deviceId || deviceId,
              isSynced: false
            }
          });
          
          // Crear alertas si aplica
          await checkAndCreateAlerts(tx, patient.id, type, validated);
          
          console.log(`[BIOMETRIC:${requestId}] ${patient.name}: BPM ${validated.bpm}`);
          
          return { type: 'BIOMETRIC', id: record.id, bpm: validated.bpm };
        }

        case 'GLUCOSE_CGM': {
          const validated = GlucoseSchema.parse(data);
          
          const record = await tx.metricLog.create({
            data: {
              patientId: patient.id,
              type: MetricType.BLOOD_GLUCOSE,
              value: validated.glucoseMgDl,
              unit: 'mg/dL',
              startedAt: recordedAt,
              endedAt: recordedAt,
              metadata: { 
                trendArrow: validated.trendArrow,
                requestId, 
                deviceId 
              },
              source: DataSource.API_INTEGRATION,
              deviceId: deviceId,
              isProcessed: false,
              hasAlert: validated.glucoseMgDl < 70 || validated.glucoseMgDl > 250
            }
          });
          
          // Crear alertas si aplica
          await checkAndCreateAlerts(tx, patient.id, type, validated);
          
          console.log(`[GLUCOSE:${requestId}] ${patient.name}: ${validated.glucoseMgDl} mg/dL`);
          
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
}