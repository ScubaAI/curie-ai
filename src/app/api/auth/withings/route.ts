// src/app/api/auth/withings/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID || '';
const WITHINGS_REDIRECT_URI = process.env.WITHINGS_REDIRECT_URI || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId required' }, { status: 400 });
  }

  const state = crypto.randomBytes(32).toString('hex');
  
  const withingsAuthUrl = new URL('https://account.withings.com/oauth2_user/authorize2');
  withingsAuthUrl.searchParams.set('response_type', 'code');
  withingsAuthUrl.searchParams.set('client_id', WITHINGS_CLIENT_ID);
  withingsAuthUrl.searchParams.set('redirect_uri', WITHINGS_REDIRECT_URI);
  withingsAuthUrl.searchParams.set('scope', 'user.metrics user.activity user.sleep');
  withingsAuthUrl.searchParams.set('state', `${state}:${patientId}`);
  
  // For frontend integration, return the URL instead of redirecting
  // The frontend will handle the redirect
  return NextResponse.json({
    authUrl: withingsAuthUrl.toString(),
    state,
    patientId,
  });
}
