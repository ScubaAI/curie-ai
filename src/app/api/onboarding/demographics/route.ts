// src/app/api/onboarding/demographics/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      patientId,
      dateOfBirth,
      gender,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      heightCm,
      targetWeightKg,
      activityLevel,
    } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    const patient = await (prisma as any).patient.update({
      where: { id: patientId },
      data: {
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(emergencyContactName !== undefined && { emergencyContactName }),
        ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
        ...(emergencyContactRelation !== undefined && { emergencyContactRelation }),
        ...(heightCm !== undefined && { heightCm }),
        ...(targetWeightKg !== undefined && { targetWeightKg }),
        ...(activityLevel && { activityLevel }),
        onboardingStep: 1,
      },
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        onboardingStep: patient.onboardingStep,
      },
    });
  } catch (error) {
    console.error('[DEMOGRAPHICS_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update demographics' },
      { status: 500 }
    );
  }
}
