import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content, category } = await request.json();
    
    const note = await prisma.doctorNote.create({
      data: {
        patientId: params.id,
        content,
        category: category || 'general',
      },
    });
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
