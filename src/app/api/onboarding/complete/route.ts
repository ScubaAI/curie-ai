// src/app/api/onboarding/complete/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    const patient = await (prisma as any).patient.update({
      where: { id: patientId },
      data: {
        onboardingCompleted: true,
        onboardingStep: 3,
      },
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        onboardingCompleted: patient.onboardingCompleted,
        onboardingStep: patient.onboardingStep,
      },
    });
  } catch (error) {
    console.error('[ONBOARDING_COMPLETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
