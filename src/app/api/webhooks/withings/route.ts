import { NextResponse } from 'next/server';
import { PrismaClient, DataSource, EventType, EventSeverity } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de notificación de Withings
const WithingsNotificationSchema = z.object({
  userid: z.string(),           // ID de Withings (mapeado a nuestro patient)
  startdate: z.number(),        // Timestamp UNIX
  enddate: z.number(),
  deviceid: z.string().optional(),
  appliver: z.string().optional(),
  // Datos de medición (varían según tipo de dispositivo)
  measures: z.array(z.object({
    type: z.number(),           // Código de medición (ver tabla abajo)
    unit: z.number(),           // Exponente de unidad (ej: -3 = gramos)
    value: z.number(),          // Valor raw
  })).optional(),
});

// Mapeo de códigos de medición Withings → nuestros campos
const WITHINGS_MEASURE_MAP: Record<number, { field: string; unit: string; divisor: number }> = {
  1:   { field: 'weight', unit: 'kg', divisor: 1000 },        // Peso (g → kg)
  5:   { field: 'fatFreeMass', unit: 'kg', divisor: 1000 },   // Masa libre de grasa
  6:   { field: 'fatRatio', unit: '%', divisor: 1000 },       // % grasa corporal
  8:   { field: 'fatMassWeight', unit: 'kg', divisor: 1000 }, // Peso grasa
  76:  { field: 'muscleMass', unit: 'kg', divisor: 1000 },    // Masa muscular (¡clave!)
  77:  { field: 'hydration', unit: 'kg', divisor: 1000 },     // Hidratación
  88:  { field: 'boneMass', unit: 'kg', divisor: 1000 },      // Masa ósea
  91:  { field: 'pulseWaveVelocity', unit: 'm/s', divisor: 1000 }, // PWV
};

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  
  try {
    // 1. Verificar firma del webhook (seguridad)
    const signature = request.headers.get('x-withings-signature');
    const body = await request.text();
    
    // TODO: Verificar HMAC-SHA256 con WITHINGS_CLIENT_SECRET
    // const isValid = verifyWithingsSignature(body, signature);
    // if (!isValid) return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });

    // 2. Parsear datos
    const data = JSON.parse(body);
    const notification = WithingsNotificationSchema.parse(data);

    // 3. Mapear userid de Withings → nuestro patientId
    // TODO: Tabla de mapeo o campo withingsUserId en Patient
    const withingsUserId = notification.userid;
    const patient = await prisma.patient.findFirst({
      where: { 
        // Opción A: Campo dedicado en schema
        // withingsUserId: withingsUserId
        
        // Opción B: Por ahora, hardcodeado para demo
        email: "abraham@visionaryai.lat"
      }
    });

    if (!patient) {
      console.error(`[WITHINGS_WEBHOOK:${requestId}] Paciente no encontrado para userid: ${withingsUserId}`);
      return NextResponse.json({ status: 'NO_PATIENT' }, { status: 200 }); // 200 para que Withings no reintente
    }

    // 4. Procesar medidas
    const measures = notification.measures || [];
    const processedData: Record<string, number> = {};
    
    for (const measure of measures) {
      const mapping = WITHINGS_MEASURE_MAP[measure.type];
      if (mapping) {
        // Withings envía: value * 10^unit = valor real
        // Ej: value=75600, unit=-3 → 75.6 kg
        const realValue = measure.value * Math.pow(10, measure.unit);
        processedData[mapping.field] = realValue;
      }
    }

    // 5. Calcular campos derivados
    const weight = processedData['weight'];
    const fatRatio = processedData['fatRatio']; // % (ya dividido)
    const muscleMass = processedData['muscleMass'];
    const hydration = processedData['hydration'];
    
    // Withings no da SMM directo, calculamos: muscleMass ≈ SMM (aproximado)
    // O usar: fatFreeMass - boneMass - hydration ≈ SMM
    
    // 6. Guardar en DB (transacción atómica)
    const result = await prisma.$transaction(async (tx) => {
      // Archivar composición anterior
      await tx.compositionRecord.updateMany({
        where: { patientId: patient.id, isLatest: true },
        data: { isLatest: false }
      });

      // Crear nueva composición
      const composition = await tx.compositionRecord.create({
        data: {
          patientId: patient.id,
          weight: weight,
          pbf: fatRatio,
          smm: muscleMass || (processedData['fatFreeMass'] - processedData['boneMass'] - hydration),
          bodyFatMass: processedData['fatMassWeight'] || (weight * fatRatio / 100),
          totalBodyWater: hydration,
          minerals: processedData['boneMass'],
          // Estimados (Withings no da estos directo):
          protein: (muscleMass || 0) * 0.2, // Aprox 20% de músculo es proteína
          bmr: Math.round(10 * weight + 6.25 * (patient.height || 175) - 5 * (patient.age || 30) + 5),
          vfl: 5, // Withings no da VFL directo, estimar o dejar null
          phaseAngle: 7.5, // Withings no da phase angle
          source: DataSource.WITHINGS_B2B, // Nuevo enum
          isLatest: true,
          date: new Date(notification.startdate * 1000),
          notes: `Device: ${notification.deviceid || 'unknown'}`
        }
      });

      // Crear snapshot biométrico si hay PWV (indicador cardiovascular)
      if (processedData['pulseWaveVelocity']) {
        await tx.biometricSnapshot.create({
          data: {
            patientId: patient.id,
            source: DataSource.WITHINGS_B2B,
            recordedAt: new Date(notification.startdate * 1000),
            // PWV no está en nuestro schema, guardar en metadata o añadir campo
          }
        });
      }

      // Detectar cambios significativos y crear alertas
      const previous = await tx.compositionRecord.findFirst({
        where: { patientId: patient.id, isLatest: false },
        orderBy: { date: 'desc' }
      });

      if (previous) {
        const weightChange = weight - previous.weight;
        const smmChange = (muscleMass || 0) - (previous.smm || 0);

        if (Math.abs(weightChange) > 2) {
          await tx.systemEvent.create({
            data: {
              patientId: patient.id,
              type: EventType.SIGNIFICANT_WEIGHT_CHANGE,
              severity: EventSeverity.WARNING,
              title: 'Cambio de peso significativo (Withings)',
              description: `${weightChange > 0 ? 'Subida' : 'Bajada'} de ${Math.abs(weightChange).toFixed(1)}kg detectada automáticamente`,
              data: { previousWeight: previous.weight, newWeight: weight, source: 'withings' },
              isRead: false,
              isProcessed: false
            }
          });
        }

        if (smmChange > 0.5) {
          await tx.systemEvent.create({
            data: {
              patientId: patient.id,
              type: EventType.MUSCLE_GAIN_DETECTED,
              severity: EventSeverity.INFO,
              title: 'Ganancia muscular detectada',
              description: `+${smmChange.toFixed(1)}kg de SMM desde última medición`,
              data: { smmChange, source: 'withings' },
              isRead: false,
              isProcessed: true
            }
          });
        }
      }

      // Actualizar lastProcessedAt
      await tx.patient.update({
        where: { id: patient.id },
        data: { lastProcessedAt: new Date() }
      });

      return composition;
    });

    console.log(`[WITHINGS_WEBHOOK:${requestId}] Procesado OK - Peso: ${weight}kg, Grasa: ${fatRatio}%`);

    return NextResponse.json({ 
      status: 'SUCCESS',
      requestId,
      processed: {
        weight: weight,
        fatRatio: fatRatio,
        muscleMass: muscleMass,
        compositionId: result.id
      }
    });

  } catch (error: any) {
    console.error(`[WITHINGS_WEBHOOK_ERROR:${requestId}]:`, error);
    
    // Siempre retornar 200 para que Withings no reintente indefinidamente
    // (guardamos el error en logs para revisión manual)
    return NextResponse.json({ 
      status: 'ERROR_LOGGED',
      requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 });
  }
}
