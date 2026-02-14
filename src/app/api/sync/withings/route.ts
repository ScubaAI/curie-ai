// src/app/api/sync/withings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decryptToken } from '@/lib/crypto';

const prisma = new PrismaClient();

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID || '';
const WITHINGS_CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: WITHINGS_CLIENT_ID,
      client_secret: WITHINGS_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  
  if (data.status !== 0) {
    throw new Error(`Failed to refresh token: ${data.error}`);
  }

  return data.body;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    // Get wearable connection
    const connection = await (prisma as any).wearableConnection.findFirst({
      where: {
        patientId,
        provider: 'WITHINGS',
        isActive: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'No active Withings connection found' },
        { status: 404 }
      );
    }

    // Decrypt tokens
    let accessToken = connection.accessToken ? decryptToken(connection.accessToken) : null;
    let refreshToken = connection.refreshToken ? decryptToken(connection.refreshToken) : null;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Invalid tokens' },
        { status: 401 }
      );
    }

    // Check if token expired and refresh if needed
    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt) < new Date()) {
      const newTokens = await refreshAccessToken(refreshToken);
      accessToken = newTokens.access_token;
      refreshToken = newTokens.refresh_token;

      // Update stored tokens
      await (prisma as any).wearableConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        },
      });
    }

    // Create sync job
    const syncJob = await (prisma as any).syncJob.create({
      data: {
        patientId,
        provider: 'WITHINGS',
        status: 'PROCESSING',
      },
    });

    // In a real implementation, this would trigger the actual sync
    // For now, we'll just return success
    console.log(`[SYNC_WITHINGS] Sync job ${syncJob.id} started for patient ${patientId}`);

    return NextResponse.json({
      success: true,
      syncJobId: syncJob.id,
      message: 'Sync started successfully',
    });
  } catch (error) {
    console.error('[SYNC_WITHINGS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    );
  }
}
