import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventSeverity, EventType } from '@/app/admin/events/types';

export async function GET(request: Request) {
    // Basic role check (this should be replaced with real auth middleware check if not already handled)

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as EventType | null;
    const severity = searchParams.get('severity') as EventSeverity | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const isRead = searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined;

    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead;

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) {
            const upTo = new Date(dateTo);
            upTo.setHours(23, 59, 59, 999);
            where.createdAt.lte = upTo;
        }
    }

    try {
        const events = await prisma.systemEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to 50 for now
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('[API Events Error]:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const { id, isRead } = await request.json();

    try {
        const event = await prisma.systemEvent.update({
            where: { id },
            data: { isRead }
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}
