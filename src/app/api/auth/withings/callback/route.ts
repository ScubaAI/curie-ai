import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID!;
const WITHINGS_CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET!;
const WITHINGS_REDIRECT_URI = 'https://curie-kappa.vercel.app/api/auth/withings/callback';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Extraer patientId del state
  const patientId = state?.split(':')[1] || 'abraham-001';

  // 1. Manejar errores de Withings
  if (error) {
    console.error(`[WITHINGS_CALLBACK_ERROR] ${error}`);
    return NextResponse.redirect(`https://curie-kappa.vercel.app/?error=withings_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`https://curie-kappa.vercel.app/?error=no_code_received`);
  }

  try {
    // 2. Intercambiar código por tokens
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

    // 3. Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // 4. Guardar tokens en DB
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        withingsUserId: withingsUserId.toString(),
        withingsToken: access_token,
        withingsRefresh: refresh_token,
        withingsExpires: expiresAt,
      },
    });

    console.log(`[WITHINGS_CALLBACK] Tokens guardados para ${patientId}`);

    // 5. Suscribir a webhooks automáticamente
    await subscribeToWebhooks(access_token, withingsUserId.toString());

    // 6. Redirigir a dashboard con éxito
    return NextResponse.redirect(`https://curie-kappa.vercel.app/?withings=connected`);

  } catch (error: any) {
    console.error('[WITHINGS_CALLBACK_ERROR]', error);
    return NextResponse.redirect(`https://curie-kappa.vercel.app/?error=token_exchange_failed`);
  }
}

// Helper: Suscribir a webhooks de Withings
async function subscribeToWebhooks(accessToken: string, userId: string) {
  const webhookUrl = 'https://curie-kappa.vercel.app/api/webhooks/withings';
  
  const response = await fetch('https://wbsapi.withings.net/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'subscribe',
      access_token: accessToken,
      url: webhookUrl,
      usercomment: 'CurieAI - Datos de composición corporal',
    }),
  });

  const data = await response.json();
  
  if (data.status === 0) {
    console.log(`[WITHINGS_WEBHOOK] Suscripción activada para user ${userId}`);
  } else {
    console.error(`[WITHINGS_WEBHOOK_ERROR] ${data.error}`);
  }
}
