// scripts/seed-inbody.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Asegurar que existe el paciente
  const patient = await prisma.patient.upsert({
    where: { email: 'abraham@visionaryai.lat' },
    update: {},
    create: {
      id: 'abraham-001',
      name: 'Abraham',
      email: 'abraham@visionaryai.lat',
      age: 22,
      height: 175.0,
      targetWeight: 80.0,
    },
  })

  console.log('Paciente:', patient.id)

  // Marcar composiciones anteriores como no-latest
  await prisma.compositionRecord.updateMany({
    where: { patientId: patient.id },
    data: { isLatest: false }
  })

  // Insertar InBody del 20.06.2025 (datos de tu foto)
  const composition = await prisma.compositionRecord.create({
    data: {
      patientId: patient.id,
      date: new Date('2025-06-20T10:44:00'),
      weight: 67.5,
      smm: 31.3,
      pbf: 18.2,
      bodyFatMass: 12.3,      // De tu foto
      totalBodyWater: 40.5,   // TBW
      protein: 11.0,          // De tu foto
      minerals: 3.66,         // De tu foto
      bmr: 1562,              // De tu foto
      vfl: 5,                 // Visceral Fat Level
      phaseAngle: 7.5,        // Ajusta si lo ves en el reporte
      waistHipRatio: 0.97,    // De tu foto
      source: 'InBody270',
      isLatest: true,
    }
  })

  console.log('✅ InBody guardado:', composition)
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })