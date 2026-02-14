// src/app/api/patient/measurements/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    // Build where clause
    const where: any = { patientId };
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.measuredAt = {};
      if (startDate) where.measuredAt.gte = new Date(startDate);
      if (endDate) where.measuredAt.lte = new Date(endDate);
    }

    // Get measurements using any type for Prisma
    const prismaAny = prisma as any;
    const measurements = await prismaAny.measurement.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get aggregated data
    const aggregated = await prismaAny.measurement.groupBy({
      by: ['type'],
      where: {
        patientId,
        ...(type ? { type } : {}),
        ...(startDate || endDate ? {
          measuredAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      _avg: { value: true },
      _max: { value: true },
      _min: { value: true },
      _count: true,
    });

    // Get total count
    const total = await prismaAny.measurement.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        measurements: measurements.map((m: any) => ({
          id: m.id,
          type: m.type,
          value: m.value,
          unit: m.unit,
          source: m.source,
          measuredAt: m.measuredAt,
          isManualEntry: m.isManualEntry,
        })),
        aggregated: aggregated.map((a: any) => ({
          type: a.type,
          avg: a._avg.value,
          max: a._max.value,
          min: a._min.value,
          count: a._count,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + measurements.length < total,
        },
      },
    });
  } catch (error) {
    console.error('[MEASUREMENTS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch measurements' },
      { status: 500 }
    );
  }
}
