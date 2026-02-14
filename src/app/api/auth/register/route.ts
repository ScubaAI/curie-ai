// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, dateOfBirth, gender, phone } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate MRN (Medical Record Number)
    const mrn = `MRN-${Date.now().toString(36).toUpperCase()}`;

    // Create User and Patient in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          phone: phone || null,
          role: 'PATIENT',
        },
      });

      // Create Patient
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          mrn,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          phone: phone || null,
          onboardingStep: 0,
          onboardingCompleted: false,
        },
      });

      return { user, patient };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      patient: {
        id: result.patient.id,
        mrn: result.patient.mrn,
        onboardingStep: result.patient.onboardingStep,
        onboardingCompleted: result.patient.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create user and patient' },
      { status: 500 }
    );
  }
}
