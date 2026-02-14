// src/app/api/doctor/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getPatientDetail } from '@/lib/doctor/patient-queries';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = await getAccessToken();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyAccessToken(token);
        if (payload.role !== 'DOCTOR' && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

        const patient = await getPatientDetail(id, doctor.id);

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found or no access' }, { status: 404 });
        }

        return NextResponse.json({ patient });
    } catch (error) {
        console.error('[API_DOCTOR_PATIENT_DETAIL]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
