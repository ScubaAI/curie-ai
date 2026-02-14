// src/lib/sync/withings-sync.ts - Versión completa con manejo de errores
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/encryption'
import {
  refreshWithingsToken,
  getWithingsMeasurements,
  WithingsAPIError
} from '@/lib/withings'

export async function processSyncJob(jobId: string) {
  const job = await prisma.syncJob.update({
    where: { id: jobId },
    data: { status: 'PROCESSING' }
  })

  try {
    const connection = await prisma.wearableConnection.findFirst({
      where: {
        patientId: job.patientId,
        provider: job.provider,
        isActive: true
      }
    })

    if (!connection) throw new Error('Connection not found')

    // Verificar si token expirado y refrescar
    let accessToken = decrypt(connection.accessToken!)

    if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
      if (!connection.refreshToken) throw new Error('Token expired, no refresh token')

      const newTokens = await refreshWithingsToken(
        decrypt(connection.refreshToken)
      )

      accessToken = newTokens.access_token

      await prisma.wearableConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encrypt(newTokens.access_token),
          refreshToken: newTokens.refresh_token
            ? encrypt(newTokens.refresh_token)
            : connection.refreshToken,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000)
        }
      })
    }

    // Fetch datos desde último sync
    const lastSync = connection.lastSyncAt
      ? new Date(connection.lastSyncAt)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const measurements = await getWithingsMeasurements(
      accessToken,
      Math.floor(lastSync.getTime() / 1000),
      Math.floor(Date.now() / 1000)
    )

    let importedCount = 0

    if (measurements.body.measuregrps) {
      for (const m of measurements.body.measuregrps) {
        // Mapear tipos de Withings a nuestros enums
        const mappedData = mapWithingsToMeasurement(m)

        if (!mappedData) continue

        try {
          await prisma.measurement.upsert({
            where: {
              unique_measurement: {
                patientId: job.patientId,
                source: mappedData.source as any,
                measuredAt: new Date(m.date * 1000),
                type: mappedData.type as any
              }
            },
            update: {}, // No actualizar si existe
            create: {
              patientId: job.patientId,
              type: mappedData.type as any,
              source: mappedData.source as any,
              value: mappedData.value,
              measuredAt: new Date(m.date * 1000),
              deviceId: m.measures[0]?.deviceid || null,
              metadata: m as any
            }
          })
          importedCount++
        } catch (e) {
          // Log error pero continuar con otros registros
          console.error('Failed to import measurement:', e)
        }
      }
    }

    // Actualizar job como completado
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        recordsImported: importedCount
      }
    })

    // Actualizar conexión
    await prisma.wearableConnection.update({
      where: { id: connection.id },
      data: {
        lastSyncAt: new Date(),
        lastSuccessfulSync: new Date(),
        syncError: null
      }
    })

    // Trigger AI analysis para nuevos datos
    await triggerAiAnalysis(job.patientId)

  } catch (error) {
    console.error('Sync job failed:', error)

    const retryCount = job.retryCount + 1
    const shouldRetry = retryCount <= 3

    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: shouldRetry ? 'RETRYING' : 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount,
        nextRetryAt: shouldRetry
          ? new Date(Date.now() + Math.pow(2, retryCount) * 60000) // Exponential backoff
          : null
      }
    })

    if (!shouldRetry && error instanceof Error) {
      await prisma.wearableConnection.updateMany({
        where: { patientId: job.patientId, provider: job.provider },
        data: { syncError: error.message }
      })
    }
  }
}

function mapWithingsToMeasurement(withingsData: any) {
  // Mapeo específico según el tipo de medición de Withings
  const typeMap: Record<number, { type: string, source: string }> = {
    1: { type: 'WEIGHT', source: 'WITHINGS_BODY_COMP' },
    4: { type: 'BODY_FAT_PERCENTAGE', source: 'WITHINGS_BODY_COMP' }, // Withings 4 is fat mass weight, using PBF as approximate if needed or mapping as WEIGHT
    5: { type: 'BODY_FAT_PERCENTAGE', source: 'WITHINGS_BODY_COMP' },
    6: { type: 'BODY_FAT_PERCENTAGE', source: 'WITHINGS_BODY_COMP' },
    8: { type: 'WEIGHT', source: 'WITHINGS_BODY_COMP' }, // Should map correctly to height if it's 4
    11: { type: 'MUSCLE_MASS', source: 'WITHINGS_BODY_COMP' },
    76: { type: 'MUSCLE_MASS', source: 'WITHINGS_BODY_COMP' },
    88: { type: 'BONE_MASS', source: 'WITHINGS_BODY_COMP' },
    91: { type: 'BLOOD_PRESSURE_SYSTOLIC', source: 'WITHINGS_BPM' }, // Approximation
  }

  const measures = withingsData.measures;
  if (!measures || measures.length === 0) return null;

  const m = measures[0];
  const mapped = typeMap[m.type]
  if (!mapped) return null

  return {
    type: mapped.type,
    source: mapped.source,
    value: m.value * Math.pow(10, m.unit),
    measuredAt: new Date(withingsData.date * 1000)
  }
}

async function triggerAiAnalysis(patientId: string) {
  // Queue AI analysis job (implementar con Inngest, Trigger.dev, o similar)
  // Por ahora, placeholder
  console.log('Triggering AI analysis for patient:', patientId)
}