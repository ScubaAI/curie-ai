// src/app/api/auth/withings/callback/route.ts - Versión mejorada
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import {
  exchangeWithingsCode,
  getWithingsUser
} from '@/lib/withings'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Validar CSRF / patientId

    if (!code) throw new Error('No authorization code')
    if (!state) throw new Error('No state (patientId) provided')

    // Intercambiar code por tokens
    const tokens = await exchangeWithingsCode(code)

    // Obtener info del usuario de Withings para vincular
    const withingsUser = await getWithingsUser(tokens.access_token)

    // Verificar si ya existe conexión activa
    const existing = await prisma.wearableConnection.findUnique({
      where: {
        patientId_provider: {
          patientId: state,
          provider: 'WITHINGS'
        }
      }
    })

    if (existing) {
      // Actualizar tokens existentes
      await prisma.wearableConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: encrypt(tokens.access_token),
          refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          isActive: true,
          syncError: null
        }
      })
    } else {
      // Crear nueva conexión
      await prisma.wearableConnection.create({
        data: {
          patientId: state,
          provider: 'WITHINGS',
          externalId: withingsUser.userid,
          accessToken: encrypt(tokens.access_token),
          refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          deviceName: 'Withings Device',
          scope: tokens.scope
        }
      })
    }

    // Crear job de sync inicial
    await prisma.syncJob.create({
      data: {
        patientId: state,
        provider: 'WITHINGS',
        status: 'PENDING'
      }
    })

    // Actualizar onboarding step
    await prisma.patient.update({
      where: { id: state },
      data: { onboardingStep: 2 }
    })

    // Redirect al siguiente paso
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/onboarding/step-3`)

  } catch (error) {
    console.error('Withings OAuth error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${appUrl}/onboarding/step-2?error=withings_auth_failed`
    )
  }
}