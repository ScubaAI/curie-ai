// src/lib/doctor/risk-calculator.ts
import { CompositionRecord, LabResult, VitalLog, Gender } from '@prisma/client';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PatientRiskProfile {
    level: RiskLevel;
    score: number; // 0-100
    factors: string[];
    recommendation: string;
}

export function calculatePatientRisk(context: {
    age?: number;
    gender?: Gender;
    compositions: CompositionRecord[];
    labs: LabResult[];
    vitals: VitalLog[];
}): PatientRiskProfile {
    let score = 0;
    const factors: string[] = [];

    const latestComp = context.compositions[0];
    const latestVitals = context.vitals;

    // 1. BMI & Comp Analysis
    if (latestComp) {
        const bmi = latestComp.weight / (1.75 * 1.75); // Fallback height handle
        if (bmi > 30) {
            score += 20;
            factors.push('Obesidad (IMC > 30)');
        }
        if (latestComp.visceralFatRating && latestComp.visceralFatRating > 10) {
            score += 25;
            factors.push('Grasa Visceral Alta');
        }
    }

    // 2. Cardiovascular Vitals
    const sysBP = latestVitals.find(v => v.type === 'BLOOD_PRESSURE_SYSTOLIC');
    if (sysBP && sysBP.value > 140) {
        score += 30;
        factors.push('Hipertensión Sistólica');
    }

    // 3. Metabolic Labs (Glucosa)
    const glucose = context.labs.find(l => l.testName.toLowerCase().includes('glucosa'));
    if (glucose && glucose.value > 126) {
        score += 40;
        factors.push('Hiperglucemia en ayunas');
    }

    // Normalize score
    score = Math.min(score, 100);

    let level: RiskLevel = 'LOW';
    let recommendation = 'Mantener monitoreo preventivo.';

    if (score >= 80) {
        level = 'CRITICAL';
        recommendation = 'Intervención inmediata requerida.';
    } else if (score >= 50) {
        level = 'HIGH';
        recommendation = 'Ajustar tratamiento y seguimiento semanal.';
    } else if (score >= 20) {
        level = 'MEDIUM';
        recommendation = 'Revisar metas en próxima consulta.';
    }

    return { level, score, factors, recommendation };
}
