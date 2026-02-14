// src/app/api/doctor/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getDoctorPatients } from '@/lib/doctor/patient-queries';

export async function GET(req: NextRequest) {
    try {
        const token = await getAccessToken();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyAccessToken(token);
        if (payload.role !== 'DOCTOR' && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || undefined;

        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

        const patients = await getDoctorPatients(doctor.id, query);

        return NextResponse.json({ patients });
    } catch (error) {
        console.error('[API_DOCTOR_PATIENTS]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
