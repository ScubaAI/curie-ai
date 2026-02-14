import { NextResponse } from 'next/server'
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET() {
  const token = await getAccessToken()

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { patient: true }
    })

    if (!user?.patient) {
      return new NextResponse('Patient not found', { status: 404 })
    }

    const patientId = user.patient.id

    // Ejecutar queries en paralelo
    const [
      compositions,
      recentMeasurements,
      wearableStatus,
      last7DaysActivity,
      aiInsights
    ] = await Promise.all([
      // Historial de composiciones corporales
      prisma.compositionRecord.findMany({
        where: { patientId },
        orderBy: { measuredAt: 'desc' },
        take: 10
      }),

      // Últimas mediciones por tipo (distinct)
      prisma.measurement.findMany({
        where: { patientId },
        distinct: ['type'],
        orderBy: { measuredAt: 'desc' },
        select: {
          type: true,
          value: true,
          unit: true,
          measuredAt: true,
          source: true
        }
      }),

      // Estado de wearables
      prisma.wearableConnection.findMany({
        where: { patientId, isActive: true },
        select: {
          provider: true,
          deviceModel: true,
          lastSuccessfulSync: true,
          syncError: true
        }
      }),

      // Actividad últimos 7 días
      prisma.biometricSnapshot.groupBy({
        by: ['recordedAt'],
        where: {
          patientId,
          recordedAt: { gte: subDays(new Date(), 7) }
        },
        _sum: {
          steps: true,
          calories: true,
          activeMinutes: true
        }
      }),

      // Insights de AI recientes
      prisma.doctorNote.findMany({
        where: {
          patientId,
          createdAt: { gte: subDays(new Date(), 30) }
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          createdAt: true,
          doctor: {
            select: {
              user: {
                select: { name: true, image: true }
              }
            }
          }
        }
      })
    ])

    return NextResponse.json({
      patient: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        onboardingCompleted: user.patient.onboardingCompleted,
        targetWeight: user.patient.targetWeightKg
      },
      compositions: compositions.map(c => ({
        id: c.id,
        date: c.measuredAt,
        weight: c.weight,
        smm: c.muscleMass,
        pbf: c.bodyFatPercentage,
        vfl: c.visceralFatRating,
        bodyFatMass: c.bodyFatMass,
        phaseAngle: c.phaseAngle,
        bmr: c.bmr
      })),
      wearableStatus,
      last7DaysActivity,
      aiInsights,
      hasWithings: wearableStatus.some(w => w.provider === 'WITHINGS'),
      quickActions: [
        { label: 'Sincronizar dispositivos', href: '/patient/connections' },
        { label: 'Subir laboratorio', href: '/patient/labs/upload' },
        { label: 'Programar cita', href: '/patient/appointments/new' }
      ]
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return new NextResponse('Unauthorized', { status: 401 })
  }
}
