// src/app/api/doctor/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getDoctorAlerts } from '@/lib/doctor/patient-queries';

export async function GET(req: NextRequest) {
    try {
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

        const alerts = await getDoctorAlerts(doctor.id);

        return NextResponse.json({ alerts });
    } catch (error) {
        console.error('[API_DOCTOR_ALERTS]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
