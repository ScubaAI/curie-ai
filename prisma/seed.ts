// prisma/seed.ts
import { PrismaClient, ActivityLevel, DataSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear paciente Abraham con datos de ejemplo
  const abraham = await prisma.patient.upsert({
    where: { email: "abraham@visionaryai.lat" },
    update: {},
    create: {
      id: "abraham-001",
      name: "Abraham",
      email: "abraham@visionaryai.lat",
      age: 32,
      height: 178,
      targetWeight: 80,
      activityLevel: ActivityLevel.VERY_ACTIVE,
      lastChatAt: new Date(),
      lastProcessedAt: new Date(),
      // Withings Integration (descomentar después de migrar)
      // withingsUserId: null,
      // withingsToken: null,
      // withingsRefresh: null,
      // withingsExpires: null,
    },
  });

  // Crear configuración
  await prisma.patientConfig.upsert({
    where: { patientId: abraham.id },
    update: {},
    create: {
      patientId: abraham.id,
      alertOnDecoViolation: true,
      alertOnDataConflict: true,
      alertThresholdBPM: 180,
      targetSMM: 40,
      targetPBF: 12,
      maxDepthAlert: 40,
    },
  });

  console.log('✅ Seed completado:', abraham.id);
}

main();