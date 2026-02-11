// src/app/api/auth/withings/callback/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Usar singleton
import crypto from 'crypto';

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID!;
const WITHINGS_CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET!;
const WITHINGS_REDIRECT_URI = process.env.WITHINGS_REDIRECT_URI || 'https://curie-kappa.vercel.app/api/auth/withings/callback';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://curie-kappa.vercel.app';

// Helper: Encriptar tokens antes de guardar
function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.TOKEN_ENCRYPTION_KEY!, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Extraer patientId del state (formato: "randomState:patientId")
  const patientId = state?.split(':')[1];

  if (error) {
    console.error(`[WITHINGS_CALLBACK_ERROR] ${error}`);
    return NextResponse.redirect(`${APP_URL}/?error=withings_auth_failed`);
  }

  if (!code || !patientId) {
    return NextResponse.redirect(`${APP_URL}/?error=invalid_params`);
  }

  try {
    // 1. Intercambiar código por tokens
    const tokenResponse = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'requesttoken',
        grant_type: 'authorization_code',
        client_id: WITHINGS_CLIENT_ID,
        client_secret: WITHINGS_CLIENT_SECRET,
        code: code,
        redirect_uri: WITHINGS_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.status !== 0) {
      throw new Error(`Withings API error: ${tokenData.error}`);
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      userid: withingsUserId,
    } = tokenData.body;

    // 2. Encriptar tokens antes de guardar
    const encryptedAccess = encryptToken(access_token);
    const encryptedRefresh = encryptToken(refresh_token);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // 3. Guardar en DB (upsert para manejar reconexiones)
    await prisma.patient.upsert({
      where: { id: patientId },
      update: {
        withingsUserId: withingsUserId.toString(),
        withingsToken: encryptedAccess,
        withingsRefresh: encryptedRefresh,
        withingsExpires: expiresAt,
        withingsConnectedAt: new Date(),
      },
      create: {
        id: patientId,
        withingsUserId: withingsUserId.toString(),
        withingsToken: encryptedAccess,
        withingsRefresh: encryptedRefresh,
        withingsExpires: expiresAt,
        withingsConnectedAt: new Date(),
      },
    });

    console.log(`[WITHINGS_CALLBACK] Tokens encriptados y guardados para ${patientId}`);

    // 4. Suscribir a webhooks (no bloquear si falla)
    try {
      await subscribeToWebhooks(access_token, withingsUserId.toString());
    } catch (webhookError) {
      console.error('[WITHINGS_WEBHOOK_ERROR]', webhookError);
      // No fallar el OAuth si el webhook falla, se puede reintentar después
    }

    return NextResponse.redirect(`${APP_URL}/dashboard?withings=connected`);

  } catch (error: any) {
    console.error('[WITHINGS_CALLBACK_ERROR]', error);
    return NextResponse.redirect(`${APP_URL}/?error=token_exchange_failed`);
  }
}

// Helper: Suscribir a webhooks de Withings
async function subscribeToWebhooks(accessToken: string, userId: string) {
  const webhookUrl = `${APP_URL}/api/webhooks/withings`;
  
  const response = await fetch('https://wbsapi.withings.net/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'subscribe',
      access_token: accessToken,
      url: webhookUrl,
      usercomment: 'CurieAI Webhook',
    }),
  });

  const data = await response.json();
  
  if (data.status === 0) {
    console.log(`[WITHINGS_WEBHOOK] Suscripción activada para user ${userId}`);
    return true;
  } else {
    throw new Error(`Withings webhook error: ${data.error}`);
  }
}