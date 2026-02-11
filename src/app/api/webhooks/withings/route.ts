import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/crypto';
import { DataSource } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { userid } = payload;

    if (!userid) {
      return NextResponse.json({ error: 'Missing userid' }, { status: 400 });
    }

    console.log(`[WITHINGS_WEBHOOK] Notificación recibida: ${userid}`);

    // Buscar paciente
    const patient = await prisma.patient.findFirst({
      where: { withingsUserId: userid.toString() }
    });

    if (!patient) {
      console.error(`[WITHINGS_WEBHOOK] Paciente no encontrado: ${userid}`);
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Verificar token
    if (!patient.withingsToken || !patient.withingsExpires) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Desencriptar y fetch datos
    const accessToken = decryptToken(patient.withingsToken);
    const compositions = await fetchWithingsData(accessToken);

    // Guardar cada medición
    for (const data of compositions) {
      await saveComposition(patient.id, data);
    }

    // Crear evento de sistema
    if (compositions.length > 0) {
      await prisma.systemEvent.create({
        data: {
          patientId: patient.id,
          type: 'NEW_DATA_AVAILABLE',
          severity: 'INFO',
          title: 'Nueva medición de Body Scan',
          description: `Se registraron ${compositions.length} nuevas mediciones`,
          isRead: false,
          isProcessed: true,
        }
      });
    }

    return NextResponse.json({ 
      status: 'ok', 
      processed: compositions.length 
    });

  } catch (error) {
    console.error('[WITHINGS_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function fetchWithingsData(accessToken: string) {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;

  const response = await fetch(
    `https://wbsapi.withings.net/measure?` + 
    new URLSearchParams({
      action: 'getmeas',
      access_token: accessToken,
      startdate: yesterday.toString(),
      enddate: now.toString(),
      meastypes: '1,6,76,77,88,91', // Peso, grasa, músculo, agua, hueso, BMI
    })
  );

  const data = await response.json();
  if (data.status !== 0) throw new Error(data.error);
  
  return data.body.measuregrps || [];
}

async function saveComposition(patientId: string, measuregrp: any) {
  const date = new Date(measuregrp.date * 1000);
  const measures = measuregrp.measures;
  
  const getValue = (type: number) => {
    const m = measures.find((x: any) => x.type === type);
    return m ? m.value * Math.pow(10, m.unit) : null;
  };

  const weight = getValue(1);
  const fatRatio = getValue(6);
  const muscleMass = getValue(76);
  const hydration = getValue(77);
  const boneMass = getValue(88);

  if (!weight) return;

  const bodyFatMass = weight * (fatRatio || 0) / 100;

  await prisma.compositionRecord.create({
    data: {
      patientId,
      date,
      weight,
      smm: muscleMass || 0,
      pbf: fatRatio || 0,
      bodyFatMass,
      totalBodyWater: weight * (hydration || 0) / 100,
      protein: null,
      minerals: boneMass || 0,
      bmr: null,
      vfl: null,
      phaseAngle: null,
      source: DataSource.WITHINGS_API,
      deviceId: measuregrp.deviceid?.toString(),
      isLatest: false,
    }
  });
}