import { prisma } from '@/lib/prisma';
import { EventSeverity } from '@prisma/client';

export async function getDoctorPatients(doctorId: string, query?: string) {
    return await prisma.patient.findMany({
        where: {
            careTeam: {
                some: {
                    doctorId: doctorId
                }
            },
            OR: query ? [
                { user: { firstName: { contains: query, mode: 'insensitive' } } },
                { user: { lastName: { contains: query, mode: 'insensitive' } } },
                { mrn: { contains: query, mode: 'insensitive' } }
            ] : undefined
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    image: true
                }
            },
            compositions: {
                orderBy: { measuredAt: 'desc' },
                take: 1
            },
            vitalLogs: {
                orderBy: { measuredAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            user: {
                lastName: 'asc'
            }
        }
    });
}

export async function getPatientDetail(patientId: string, doctorId: string) {
    // Verificar acceso
    const relationship = await prisma.doctorPatientRelationship.findUnique({
        where: {
            doctorId_patientId: {
                doctorId,
                patientId
            }
        }
    });

    if (!relationship) return null;

    return await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            user: true,
            compositions: {
                orderBy: { measuredAt: 'desc' },
                take: 10
            },
            labResults: {
                orderBy: { reportedAt: 'desc' }
            },
            doctorNotes: {
                where: { doctorId },
                orderBy: { createdAt: 'desc' }
            },
            vitalLogs: {
                orderBy: { measuredAt: 'desc' },
                take: 50
            },
            wearables: true
        }
    });
}

export async function getDoctorAlerts(doctorId: string) {
    // Simulación de alertas basadas en eventos del sistema para pacientes del doctor
    const patients = await prisma.doctorPatientRelationship.findMany({
        where: { doctorId },
        select: { patientId: true }
    });

    const patientIds = patients.map(p => p.patientId);

    // En una arquitectura real, filtraríamos SystemEvent por patientId si tuviéramos esa relación directa
    // Por ahora, generamos alertas dinámicas basadas en las últimas mediciones críticas
    const criticalMeasurements = await prisma.vitalLog.findMany({
        where: {
            patientId: { in: patientIds },
            value: {
                // Lógica simple de threshold
                gt: 140 // Ejemplo para presión sistólica
            }
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        },
        orderBy: { measuredAt: 'desc' },
        take: 10
    });

    return criticalMeasurements.map(m => ({
        id: m.id,
        patientName: `${m.patient.user.firstName} ${m.patient.user.lastName}`,
        type: m.type,
        value: m.value,
        severity: 'HIGH' as EventSeverity,
        timestamp: m.measuredAt
    }));
}
