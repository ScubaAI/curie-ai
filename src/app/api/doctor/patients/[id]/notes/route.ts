// src/app/api/doctor/patients/[id]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { NoteCategory } from '@prisma/client';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getAccessToken();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyAccessToken(token);
        if (payload.role !== 'DOCTOR' && payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { content, category, title, diagnosis, treatment, plan } = await req.json();

        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

        const note = await prisma.doctorNote.create({
            data: {
                patientId: params.id,
                doctorId: doctor.id,
                content,
                category: (category as NoteCategory) || 'GENERAL',
                title,
                diagnosis: diagnosis || [],
                treatment,
                plan
            }
        });

        return NextResponse.json({ note });
    } catch (error) {
        console.error('[API_DOCTOR_SAVE_NOTE]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getAccessToken();
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyAccessToken(token);
        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

        const notes = await prisma.doctorNote.findMany({
            where: {
                patientId: params.id,
                doctorId: doctor.id
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ notes });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
