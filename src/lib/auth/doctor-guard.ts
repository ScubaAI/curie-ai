// src/lib/auth/doctor-guard.ts
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from './session';

export async function checkDoctorPatientAccess(token: string, patientId: string) {
    try {
        const payload = verifyAccessToken(token);

        if (payload.role !== 'DOCTOR' && payload.role !== 'ADMIN') {
            return false;
        }

        if (payload.role === 'ADMIN') return true;

        // Obtener el ID del doctor asociado al usuario
        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctor) return false;

        // Verificar relación con el paciente
        const relationship = await prisma.doctorPatientRelationship.findUnique({
            where: {
                doctorId_patientId: {
                    doctorId: doctor.id,
                    patientId: patientId
                }
            }
        });

        return !!relationship;
    } catch (e) {
        return false;
    }
}
