import { NextResponse } from 'next/server';
import crypto from 'crypto';

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID!;
const WITHINGS_REDIRECT_URI = 'https://curie-kappa.vercel.app/api/auth/withings/callback';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'abraham-001';

  // Generar state para seguridad (prevenir CSRF)
  const state = crypto.randomBytes(32).toString('hex');
  
  // Guardar state temporalmente (en prod: Redis o cookie segura)
  // Por ahora: URL param simple, en prod usar session/cookie
  
  const withingsAuthUrl = new URL('https://account.withings.com/oauth2_user/authorize2');
  
  withingsAuthUrl.searchParams.set('response_type', 'code');
  withingsAuthUrl.searchParams.set('client_id', WITHINGS_CLIENT_ID);
  withingsAuthUrl.searchParams.set('redirect_uri', WITHINGS_REDIRECT_URI);
  withingsAuthUrl.searchParams.set('scope', 'user.metrics user.activity user.sleep'); // Permisos necesarios
  withingsAuthUrl.searchParams.set('state', `${state}:${patientId}`); // Encodamos patientId en state
  
  console.log(`[WITHINGS_OAUTH] Iniciando para paciente: ${patientId}`);

  return NextResponse.redirect(withingsAuthUrl.toString());
}
