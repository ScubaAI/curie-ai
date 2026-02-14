// src/app/api/doctor/patients/[id]/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { WearableProvider } from '@prisma/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DashboardResponse {
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        age?: number;
        height?: number;
        targetWeight?: number;
        phone?: string;
        riskLevel: 'low' | 'medium' | 'high';
        lastVisit?: string;
        primaryGoal?: string;
        activityLevel?: string;
    };
    compositions: Array<{
        id: string;
        date: string;
        weight: number;
        smm?: number;
        pbf?: number;
        bodyFatMass?: number;
        phaseAngle?: number;
        bmr?: number;
        vfl?: number;
        leanMass?: number;
        boneMass?: number;
        waterPercentage?: number;
    }>;
    wearableStatus: Array<{
        provider: string;
        deviceModel?: string;
        lastSuccessfulSync?: string;
        syncError?: string;
        isActive: boolean;
    }>;
    hasWithings: boolean;
    goals: string[];
    alerts: ClinicalAlert[];
    recentMeasurements: Array<{
        type: string;
        value: number;
        unit: string;
        measuredAt: string;
        source?: string;
    }>;
}

interface ClinicalAlert {
    id: string;
    type: 'weight' | 'composition' | 'sync' | 'compliance' | 'measurement';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    date: string;
    metadata?: Record<string, any>;
}

// ============================================================================
// HELPERS
// ============================================================================

async function verifyDoctorAccess() {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const payload = verifyAccessToken(token);
        if (!['DOCTOR', 'ADMIN'].includes(payload.role)) return null;

        const doctor = await prisma.doctor.findUnique({
            where: { userId: payload.userId },
        });
        return doctor;
    } catch {
        return null;
    }
}

function calculateAge(dateOfBirth: Date | null): number | undefined {
    if (!dateOfBirth) return undefined;

    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }

    return age;
}

function calculateRiskLevel(compositions: any[]): 'low' | 'medium' | 'high' {
    if (!compositions || compositions.length === 0) return 'medium';

    const latest = compositions[0];

    // Heurística multicapa: grasa corporal + relación cintura-cadera si existe
    if (latest.bodyFatPercentage && latest.bodyFatPercentage > 35) return 'high';
    if (latest.visceralFatRating && latest.visceralFatRating > 12) return 'high';
    if (latest.waistHipRatio && latest.waistHipRatio > 1.0) return 'high'; // Masculino
    if (latest.waistHipRatio && latest.waistHipRatio > 0.85) return 'high'; // Femenino

    if (latest.bodyFatPercentage && latest.bodyFatPercentage > 25) return 'medium';
    if (latest.visceralFatRating && latest.visceralFatRating > 8) return 'medium';

    return 'low';
}

function generateClinicalAlerts(
    patient: any,
    compositions: any[],
    wearables: any[],
    recentMeasurements: any[]
): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];

    // 1. Alerta de Sincronización Wearable
    const withings = wearables.find(
        (w) => w.provider === WearableProvider.WITHINGS && w.isActive
    );

    if (withings?.lastSuccessfulSync) {
        const lastSync = new Date(withings.lastSuccessfulSync);
        const diffHours = Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60 * 60));

        if (diffHours > 24) {
            const diffDays = Math.floor(diffHours / 24);
            alerts.push({
                id: `sync-${withings.id}`,
                type: 'sync',
                message: `Withings ${withings.deviceModel || 'dispositivo'} sin sincronizar: ${diffDays} día${diffDays > 1 ? 's' : ''}`,
                severity: diffDays > 7 ? 'critical' : diffDays > 3 ? 'warning' : 'info',
                date: new Date().toISOString(),
                metadata: {
                    lastSync: withings.lastSuccessfulSync,
                    deviceModel: withings.deviceModel,
                    hoursSinceSync: diffHours,
                },
            });
        }
    } else if (wearables.length === 0) {
        alerts.push({
            id: 'no-wearables',
            type: 'compliance',
            message: 'Paciente sin dispositivos wearables conectados',
            severity: 'info',
            date: new Date().toISOString(),
        });
    }

    // 2. Alerta de Cambio de Peso Significativo
    if (compositions.length >= 2) {
        const [latest, previous] = [compositions[0], compositions[1]];
        const weightDiff = latest.weight - previous.weight;
        const absDiff = Math.abs(weightDiff);
        const daysBetween = Math.floor(
            (new Date(latest.measuredAt).getTime() - new Date(previous.measuredAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (absDiff > 2 && daysBetween <= 30) {
            const isGain = weightDiff > 0;
            const direction = isGain ? 'aumento' : 'pérdida';

            // Contexto clínico: pérdida rápida siempre preocupante
            let severity: 'info' | 'warning' | 'critical' = 'info';
            if (!isGain && absDiff > 5) severity = 'critical';
            else if (isGain && absDiff > 4) severity = 'warning';
            else if (absDiff > 3) severity = 'warning';

            alerts.push({
                id: `weight-${latest.id}`,
                type: 'weight',
                message: `${direction === 'aumento' ? '↑' : '↓'} ${direction} de ${absDiff.toFixed(1)} kg en ${daysBetween} días`,
                severity,
                date: latest.measuredAt.toISOString(),
                metadata: {
                    absoluteChange: absDiff,
                    percentageChange: ((absDiff / previous.weight) * 100).toFixed(1),
                    direction: isGain ? 'gain' : 'loss',
                    previousWeight: previous.weight,
                    currentWeight: latest.weight,
                },
            });
        }
    }

    // 3. Alerta de Proximidad a Meta
    if (patient.targetWeight && compositions[0]) {
        const current = compositions[0].weight;
        const target = patient.targetWeight;
        const diff = Math.abs(current - target);
        const percentageToGoal = (diff / target) * 100;

        if (diff < 1.5) {
            alerts.push({
                id: 'goal-proximity',
                type: 'compliance',
                message: `🎯 ¡A ${diff.toFixed(1)} kg de la meta objetivo!`,
                severity: 'info',
                date: new Date().toISOString(),
                metadata: {
                    targetWeight: target,
                    currentWeight: current,
                    percentageToGoal: percentageToGoal.toFixed(1),
                },
            });
        }
    }

    // 4. Alerta de Composición Corporal Crítica
    if (compositions[0]) {
        const latest = compositions[0];

        if (latest.visceralFatRating && latest.visceralFatRating > 15) {
            alerts.push({
                id: `visceral-${latest.id}`,
                type: 'composition',
                message: `⚠️ Grasa visceral elevada: ${latest.visceralFatRating} (riesgo cardiometabólico)`,
                severity: 'critical',
                date: latest.measuredAt.toISOString(),
                metadata: { visceralFat: latest.visceralFatRating, threshold: 15 },
            });
        }

        if (latest.phaseAngle && latest.phaseAngle < 4.5) {
            alerts.push({
                id: `phase-${latest.id}`,
                type: 'composition',
                message: `Ángulo de fase bajo (${latest.phaseAngle}°): posible desnutrición celular`,
                severity: 'warning',
                date: latest.measuredAt.toISOString(),
                metadata: { phaseAngle: latest.phaseAngle, threshold: 4.5 },
            });
        }
    }

    // 5. Alerta de Medición Reciente Crítica (si existe)
    const criticalMeasurement = recentMeasurements.find((m) => {
        if (m.type === 'BLOOD_PRESSURE_SYSTOLIC' && m.value > 160) return true;
        if (m.type === 'BLOOD_GLUCOSE' && m.value > 180) return true;
        if (m.type === 'HEART_RATE' && (m.value < 50 || m.value > 120)) return true;
        return false;
    });

    if (criticalMeasurement) {
        alerts.push({
            id: `vitals-${criticalMeasurement.id || Date.now()}`,
            type: 'measurement',
            message: `Signo vital crítico detectado: ${criticalMeasurement.type} = ${criticalMeasurement.value}`,
            severity: 'critical',
            date: criticalMeasurement.measuredAt,
            metadata: criticalMeasurement,
        });
    }

    // Ordenar por severidad
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Next.js 15+ requires await for params
        const { id } = await params;
        const patientId = id; // Alias for compatibility with existing logic

        // 1. Authentication
        const doctor = await verifyDoctorAccess();
        if (!doctor) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Authorization - Verify doctor-patient relationship
        const relationship = await prisma.doctorPatientRelationship.findFirst({
            where: {
                patientId,
                doctorId: doctor.id,
                status: 'active',
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Patient not found or access denied' },
                { status: 404 }
            );
        }

        // 3. Fetch patient data with all relations
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                compositions: {
                    orderBy: { measuredAt: 'desc' },
                    take: 10,
                },
                wearables: {
                    where: { isActive: true },
                    orderBy: { lastSuccessfulSync: 'desc' },
                },
                measurements: {
                    where: {
                        measuredAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
                        },
                    },
                    orderBy: { measuredAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // 4. Generate clinical alerts
        const alerts = generateClinicalAlerts(
            patient,
            patient.compositions,
            patient.wearables,
            patient.measurements
        );

        // 5. Build goals array from patient data
        const goals: string[] = [];
        if (patient.primaryGoal) goals.push(patient.primaryGoal);
        if (patient.targetWeight) goals.push(`Peso objetivo: ${patient.targetWeight} kg`);
        if (patient.targetBodyFat) goals.push(`Grasa objetivo: ${patient.targetBodyFat}%`);
        if (patient.targetMuscleMass) goals.push(`Músculo objetivo: ${patient.targetMuscleMass} kg`);

        // 6. Format response
        const response: DashboardResponse = {
            patient: {
                id: patient.id,
                firstName: patient.user.firstName || 'Paciente',
                lastName: patient.user.lastName || '',
                email: patient.user.email,
                age: calculateAge(patient.dateOfBirth),
                height: patient.heightCm || undefined,
                targetWeight: patient.targetWeight || undefined,
                phone: patient.user.phone || patient.phone || undefined,
                riskLevel: calculateRiskLevel(patient.compositions),
                lastVisit: patient.compositions[0]?.measuredAt?.toISOString(),
                primaryGoal: patient.primaryGoal || undefined,
                activityLevel: patient.activityLevel || undefined,
            },
            compositions: patient.compositions.map((c) => ({
                id: c.id,
                date: c.measuredAt?.toISOString() || new Date().toISOString(),
                weight: c.weight,
                smm: c.muscleMass || undefined,
                pbf: c.bodyFatPercentage || undefined,
                bodyFatMass: c.bodyFatMass || undefined,
                phaseAngle: c.phaseAngle || undefined,
                bmr: c.bmr || undefined,
                vfl: c.visceralFatRating || undefined,
                leanMass: c.leanMass || undefined,
                boneMass: c.boneMass || undefined,
                waterPercentage: c.waterPercentage || undefined,
            })),
            wearableStatus: patient.wearables.map((w) => ({
                provider: w.provider,
                deviceModel: w.deviceModel || undefined,
                lastSuccessfulSync: w.lastSuccessfulSync?.toISOString(),
                syncError: w.syncError || undefined,
                isActive: w.isActive,
            })),
            hasWithings: patient.wearables.some(
                (w) => w.provider === WearableProvider.WITHINGS && w.isActive
            ),
            goals,
            alerts,
            recentMeasurements: patient.measurements.map((m) => ({
                type: m.type,
                value: m.value,
                unit: m.unit || '',
                measuredAt: m.measuredAt.toISOString(),
                source: m.source || undefined,
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Doctor dashboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
