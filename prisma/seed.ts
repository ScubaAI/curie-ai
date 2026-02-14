// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed limpio y hermoso...');

  // 1. Crear paciente Bryan Jaramillo
  const bryanPassword = await hashPassword('bryan123456');

  const bryanUser = await prisma.user.upsert({
    where: { email: 'bryan.jaramillo@email.com' },
    update: {},
    create: {
      email: 'bryan.jaramillo@email.com',
      password: bryanPassword,
      firstName: 'Bryan',
      lastName: 'Jaramillo',
      name: 'Bryan Jaramillo',
      role: 'PATIENT',
    },
  });

  // Crear Patient relacionado
  const bryanPatient = await prisma.patient.upsert({
    where: { userId: bryanUser.id },
    update: {},
    create: {
      userId: bryanUser.id,
      dateOfBirth: new Date('1999-06-15'),
      gender: 'MALE',
      heightCm: 178,
      targetWeightKg: 75,           // Ajusta si el campo cambió de nombre
      activityLevel: 'MODERATELY_ACTIVE',
      primaryGoal: 'Ganar masa muscular, reducir grasa visceral',
      onboardingStep: 4,
      onboardingCompleted: true,
    },
  });

  // Crear composiciones de ejemplo (en CompositionRecord)
  await prisma.compositionRecord.createMany({
    data: [
      {
        patientId: bryanPatient.id,
        measuredAt: new Date('2025-02-10'),
        source: 'INBODY_970',
        weight: 82.5,
        bodyFatMass: 14.2,
        leanMass: 68.3,
        muscleMass: 38.5,
        bodyFatPercentage: 17.2,
        waterPercentage: 55.8,
        visceralFatRating: 9,
        bmr: 1820,
        rightArmMuscle: 3.2,
        leftArmMuscle: 3.1,
        trunkMuscle: 22.5,
        rightLegMuscle: 5.8,
        leftLegMuscle: 5.7,
        phaseAngle: 6.2,
        notes: 'Medición inicial - buena base muscular',
      },
      {
        patientId: bryanPatient.id,
        measuredAt: new Date('2025-02-03'),
        source: 'INBODY_970',
        weight: 83.1,
        bodyFatMass: 15.1,
        leanMass: 68.0,
        muscleMass: 38.2,
        bodyFatPercentage: 18.2,
        waterPercentage: 55.2,
        visceralFatRating: 10,
        bmr: 1835,
        phaseAngle: 6.0,
      },
      // Agrega más si quieres...
    ],
    skipDuplicates: true,
  });

  // Crear mediciones de ejemplo (Measurement)
  await prisma.measurement.createMany({
    data: [
      {
        patientId: bryanPatient.id,
        type: 'HEART_RATE',
        value: 62,
        unit: 'bpm',
        source: 'MANUAL_ENTRY',
        measuredAt: new Date('2025-02-10T08:00:00'),
      },
      {
        patientId: bryanPatient.id,
        type: 'BLOOD_PRESSURE_SYSTOLIC',
        value: 118,
        unit: 'mmHg',
        source: 'MANUAL_ENTRY',
        measuredAt: new Date('2025-02-10T08:00:00'),
      },
      // ...
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Bryan creado: ${bryanUser.email} (Patient ID: ${bryanPatient.id})`);

  // 2. Crear Abraham (si no existe)
  const abrahamPassword = await hashPassword('abraham123456');

  const abrahamUser = await prisma.user.upsert({
    where: { email: 'abraham@visionaryai.lat' },
    update: {},
    create: {
      email: 'abraham@visionaryai.lat',
      password: abrahamPassword,
      firstName: 'Abraham',
      lastName: 'Visionary',
      name: 'Abraham Visionary',
      role: 'PATIENT',
    },
  });

  const abrahamPatient = await prisma.patient.upsert({
    where: { userId: abrahamUser.id },
    update: {},
    create: {
      userId: abrahamUser.id,
      dateOfBirth: new Date('1989-01-01'),
      gender: 'MALE',
      heightCm: 175,
      targetWeightKg: 80,
      onboardingStep: 4,
      onboardingCompleted: true,
    },
  });

  // Composición simple para Abraham
  await prisma.compositionRecord.create({
    data: {
      patientId: abrahamPatient.id,
      measuredAt: new Date('2025-02-01'),
      source: 'INBODY_970',
      weight: 78.5,
      bodyFatMass: 12.0,
      muscleMass: 35.2,
      bodyFatPercentage: 15.3,
      visceralFatRating: 8,
      bmr: 1750,
      phaseAngle: 5.8,
    },
  });

  console.log(`✅ Abraham creado: ${abrahamUser.email}`);

  // 3. Crear doctor de ejemplo
  const doctorPassword = await hashPassword('doctor123456');

  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.garcia@curie.health' },
    update: {},
    create: {
      email: 'dr.garcia@curie.health',
      password: doctorPassword,
      firstName: 'María',
      lastName: 'García',
      name: 'Dra. María García',
      role: 'DOCTOR',
    },
  });

  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      licenseNumber: 'MED-GT-12345',
      specialty: 'Medicina Interna',
      subspecialties: ['Nutrición Clínica', 'Medicina del Deporte'],
      clinicName: 'Centro Médico Curie',
      clinicAddress: 'Zona 10, Ciudad de Guatemala',
      consultationFee: 800,
      bio: 'Especialista en medicina preventiva y optimización del rendimiento físico',
      yearsOfExperience: 12,
      acceptingPatients: true,
      languages: ['es', 'en'],
      isVerified: true,
    },
  });

  console.log(`✅ Doctor creado: ${doctorUser.email}`);

  console.log('\n🎉 Seed finalizado con éxito!');
  console.log('Credenciales de prueba:');
  console.log('  Bryan: bryan.jaramillo@email.com / bryan123456');
  console.log('  Abraham: abraham@visionaryai.lat / abraham123456');
  console.log('  Doctor: dr.garcia@curie.health / doctor123456');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });