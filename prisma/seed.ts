import { PrismaClient, DataSource, ActivityLevel, EventSeverity, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crear paciente Abraham
  const abraham = await prisma.patient.upsert({
    where: { email: 'abraham@visionaryai.lat' },
    update: {},
    create: {
      id: 'abraham-001',
      name: 'Abraham',
      email: 'abraham@visionaryai.lat',
      age: 34,
      height: 178,
      targetWeight: 80,
      activityLevel: ActivityLevel.EXTREMELY_ACTIVE,
    },
  });

  console.log('✅ Patient created:', abraham.id);

  // 2. Composición corporal inicial (última medición)
  const composition = await prisma.compositionRecord.create({
    data: {
      patientId: abraham.id,
      date: new Date('2026-02-10T08:30:00Z'),
      weight: 78.5,
      smm: 36.2,
      pbf: 16.8,
      bodyFatMass: 13.2,
      totalBodyWater: 48.3,
      protein: 12.4,
      minerals: 3.1,
      bmr: 1850,
      vfl: 4,
      phaseAngle: 7.2,
      waistHipRatio: 0.88,
      source: DataSource.INBODY_970,
      deviceId: 'INBODY-970-001',
      isLatest: true,
      notes: 'Medición post-entreno, ayuno 12h',
    },
  });

  console.log('✅ Composition recorded:', composition.id);

  // 3. Composición anterior (para tendencias)
  await prisma.compositionRecord.create({
    data: {
      patientId: abraham.id,
      date: new Date('2026-01-15T08:30:00Z'),
      weight: 79.2,
      smm: 35.8,
      pbf: 17.2,
      bodyFatMass: 13.6,
      totalBodyWater: 47.9,
      protein: 12.2,
      minerals: 3.0,
      bmr: 1840,
      vfl: 5,
      phaseAngle: 6.9,
      waistHipRatio: 0.89,
      source: DataSource.INBODY_970,
      deviceId: 'INBODY-970-001',
      isLatest: false,
      notes: 'Baseline pre-ciclo de fuerza',
    },
  });

  // 4. Métrica de buceo (última inmersión)
  await prisma.metricLog.create({
    data: {
      patientId: abraham.id,
      type: 'DEPTH' as any,
      value: 32.5,
      unit: 'm',
      startedAt: new Date('2026-02-08T14:30:00Z'),
      endedAt: new Date('2026-02-08T14:52:00Z'),
      duration: 1320,
      metadata: {
        decompressionViolated: false,
        safetyStop: true,
        gasMix: '32%',
        bottomTime: 18,
      },
      location: {
        lat: 20.2147,
        lng: -87.4298,
        site: 'Cenote Dos Ojos',
      },
      source: DataSource.SHEARWATER_PERDIX,
      deviceId: 'PERDIX-AI-7782',
      isProcessed: true,
      hasAlert: false,
    },
  });

  // 5. Evento de sistema (ejemplo)
  await prisma.systemEvent.create({
    data: {
      patientId: abraham.id,
      type: EventType.SYNC_COMPLETED,
      severity: EventSeverity.INFO,
      title: 'Sincronización completada',
      description: 'Datos de Shearwater Perdix sincronizados correctamente',
      data: { device: 'SHEARWATER_PERDIX', records: 1 },
      isRead: true,
      isProcessed: true,
      createdAt: new Date('2026-02-08T15:00:00Z'),
    },
  });

  // 6. Receta activa (TRT)
  await prisma.prescription.create({
    data: {
      patientId: abraham.id,
      medication: 'Enantato de Testosterona',
      dosage: '250mg',
      frequency: 'Cada 7 días (lunes AM)',
      prescribedBy: 'Dr. García (Endocrinología)',
      prescribedAt: new Date('2025-01-01'),
      validUntil: new Date('2025-07-01'),
      notes: 'Aplicación IM profunda en glúteo. Rotar sitios.',
      isActive: true,
    },
  });

  // 7. Configuración del paciente
  await prisma.patientConfig.create({
    data: {
      patientId: abraham.id,
      alertOnDecoViolation: true,
      alertOnDataConflict: true,
      alertThresholdBPM: 100,
      preferredUnitWeight: 'kg',
      preferredUnitHeight: 'cm',
      targetSMM: 38.0,
      targetPBF: 15.0,
      maxDepthAlert: 45.0,
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
