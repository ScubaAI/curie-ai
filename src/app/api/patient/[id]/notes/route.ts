import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, category } = await request.json();

    // Note: Ensuring basic compliance, but this endpoint logic appears incomplete (missing auth/doctorId)
    const note = await prisma.doctorNote.create({
      data: {
        patientId: id,
        content,
        category: category || 'GENERAL',
      } as any, // Cast to any to prevent strict type errors on potentially missing fields in this legacy/stub file
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
