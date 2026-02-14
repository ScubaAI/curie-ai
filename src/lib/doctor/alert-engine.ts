// src/lib/doctor/alert-engine.ts
import { EventSeverity, MeasurementType } from '@prisma/client';

export interface ClinicalAlert {
    id: string;
    patientId: string;
    patientName: string;
    type: string;
    message: string;
    severity: EventSeverity;
    timestamp: Date;
    metadata?: any;
}

export function processMeasurementForAlerts(
    patientId: string,
    patientName: string,
    type: MeasurementType,
    value: number
): ClinicalAlert | null {
    // Thresholds médicos básicos para Curie
    const thresholds: Record<string, { high?: number; low?: number; severity: EventSeverity }> = {
        BLOOD_PRESSURE_SYSTOLIC: { high: 160, severity: 'CRITICAL' },
        BLOOD_PRESSURE_DIASTOLIC: { high: 100, severity: 'CRITICAL' },
        HEART_RATE: { high: 120, low: 40, severity: 'HIGH' },
        BLOOD_OXYGEN: { low: 90, severity: 'CRITICAL' },
        BLOOD_GLUCOSE: { high: 200, low: 70, severity: 'HIGH' }
    };

    const rule = thresholds[type];
    if (!rule) return null;

    let triggered = false;
    let message = "";

    if (rule.high && value >= rule.high) {
        triggered = true;
        message = `Valor elevado de ${type}: ${value}`;
    } else if (rule.low && value <= rule.low) {
        triggered = true;
        message = `Valor bajo de ${type}: ${value}`;
    }

    if (triggered) {
        return {
            id: `alert-${Date.now()}`,
            patientId,
            patientName,
            type,
            message,
            severity: rule.severity,
            timestamp: new Date()
        };
    }

    return null;
}
