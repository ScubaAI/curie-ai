// src/app/api/advisor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { EventSeverity, EventType } from '@prisma/client';

const ARKANGEL_URL = "https://api.arkangelai.com/v1/chat";

// Interfaces médicas enriquecidas
interface PatientContext {
  id: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  targetWeightKg?: number;

  // Última composición
  latestComposition?: {
    date: string;
    weight: number;
    bodyFatPercentage: number;
    muscleMass: number;
    visceralFatRating: number;
    phaseAngle?: number;
    bmr?: number;
  };

  // Tendencia (últimos 3 meses)
  trend3Months?: {
    weightChangeKg: number;
    bodyFatChange: number;
    muscleChange: number;
  };

  // Labs recientes
  recentLabs?: Array<{
    testName: string;
    value: number;
    unit: string;
    status: 'normal' | 'abnormal' | 'critical';
    date: string;
  }>;

  // Wearables resumen
  wearableSummary?: {
    lastSync: string;
    avgSleepScore?: number;
    avgRestingHR?: number;
    stepTrend?: 'increasing' | 'stable' | 'decreasing';
    anomalyDetected?: boolean;
  };

  // Alertas activas
  activeAlerts: string[];
}

interface AdvisorRequest {
  message: string;
  conversation_id?: string;
  patientId: string;
  doctorId: string;
  file_ids?: string[];
  language?: string;
}

interface ClinicalInsight {
  type: 'alert' | 'trend' | 'suggestion' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'weight' | 'composition' | 'cardio' | 'metabolic' | 'sleep' | 'activity';
  title: string;
  description: string;
  data?: Record<string, any>;
  suggestedAction?: string;
}

// Helpers clínicos
function calculateBMI(weight: number, heightCm: number): { value: number; category: string } {
  const bmi = weight / ((heightCm / 100) ** 2);
  let category = 'normal';
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';
  return { value: parseFloat(bmi.toFixed(1)), category };
}

async function getPatientContext(patientId: string): Promise<PatientContext | null> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      },
      compositions: {
        orderBy: { measuredAt: 'desc' },
        take: 4,
      },
      labResults: {
        where: {
          reportedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { reportedAt: 'desc' },
        take: 10,
      },
      wearables: {
        where: { isActive: true },
        take: 1,
      },
      biometrics: {
        orderBy: { recordedAt: 'desc' },
        take: 7,
      }
    }
  });

  if (!patient) return null;

  const latest = patient.compositions[0];
  const previous = patient.compositions[3]; // ~3 meses atrás si mensual

  const bmi = calculateBMI(
    latest?.weight || patient.targetWeightKg || 70,
    patient.heightCm || 170
  );

  // Detectar labs críticos
  const criticalLabs = patient.labResults
    .filter(lab => lab.status === 'CRITICAL' || lab.status === 'ABNORMAL')
    .map(lab => ({
      testName: lab.testName,
      value: lab.value,
      unit: lab.unit || '',
      status: lab.status.toLowerCase() as 'normal' | 'abnormal' | 'critical',
      date: lab.reportedAt.toISOString(),
    }));

  // Resumen wearable
  const wearable = patient.wearables[0];
  const recentBiometrics = patient.biometrics;
  const avgSleep = recentBiometrics.length > 0
    ? recentBiometrics.reduce((sum, b) => sum + (b.sleepScore || 0), 0) / recentBiometrics.filter(b => b.sleepScore).length
    : undefined;

  // Alertas activas
  const alerts: string[] = [];
  if (latest?.visceralFatRating && latest.visceralFatRating > 10) {
    alerts.push('Grasa visceral elevada (>10)');
  }
  if (latest?.phaseAngle && latest.phaseAngle < 4) {
    alerts.push('Phase angle bajo - posible desnutrición celular');
  }
  if (criticalLabs.some(l => l.testName.toLowerCase().includes('glucosa') && l.value > 126)) {
    alerts.push('Glucosa en ayunas >126 mg/dL - evaluar diabetes');
  }

  return {
    id: patient.id,
    name: `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Paciente',
    age: patient.age || calculateAge(patient.dateOfBirth),
    gender: patient.gender || 'No especificado',
    heightCm: patient.heightCm || 170,
    weightKg: latest?.weight || 0,
    bmi: bmi.value,
    bmiCategory: bmi.category,
    targetWeightKg: patient.targetWeightKg || undefined,

    latestComposition: latest ? {
      date: latest.measuredAt.toISOString(),
      weight: latest.weight,
      bodyFatPercentage: latest.bodyFatPercentage || 0,
      muscleMass: latest.muscleMass || 0,
      visceralFatRating: latest.visceralFatRating || 0,
      phaseAngle: latest.phaseAngle || undefined,
      bmr: latest.bmr || undefined,
    } : undefined,

    trend3Months: (latest && previous) ? {
      weightChangeKg: parseFloat((latest.weight - previous.weight).toFixed(1)),
      bodyFatChange: parseFloat(((latest.bodyFatPercentage || 0) - (previous.bodyFatPercentage || 0)).toFixed(1)),
      muscleChange: parseFloat(((latest.muscleMass || 0) - (previous.muscleMass || 0)).toFixed(1)),
    } : undefined,

    recentLabs: criticalLabs.slice(0, 5),

    wearableSummary: wearable ? {
      lastSync: wearable.lastSyncAt?.toISOString() || 'No sincronizado',
      avgSleepScore: avgSleep ? Math.round(avgSleep) : undefined,
      avgRestingHR: recentBiometrics[0]?.restingHeartRate || undefined,
      stepTrend: detectStepTrend(recentBiometrics),
      anomalyDetected: alerts.length > 0,
    } : undefined,

    activeAlerts: alerts,
  };
}

function calculateAge(dateOfBirth: Date | null): number {
  if (!dateOfBirth) return 0;
  const diff = Date.now() - dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function detectStepTrend(biometrics: any[]): 'increasing' | 'stable' | 'decreasing' {
  if (biometrics.length < 3) return 'stable';
  const recent = biometrics.slice(0, 3).reduce((s, b) => s + (b.steps || 0), 0) / 3;
  const older = biometrics.slice(-3).reduce((s, b) => s + (b.steps || 0), 0) / 3;
  if (recent > older * 1.1) return 'increasing';
  if (recent < older * 0.9) return 'decreasing';
  return 'stable';
}

function generatePreConsultationInsights(context: PatientContext): ClinicalInsight[] {
  const insights: ClinicalInsight[] = [];

  // BMI Analysis
  if (context.bmiCategory !== 'normal') {
    insights.push({
      type: 'alert',
      severity: context.bmiCategory === 'obese' ? 'high' : 'medium',
      category: 'weight',
      title: `IMC ${context.bmi} - ${context.bmiCategory}`,
      description: context.bmiCategory === 'obese'
        ? 'Obesidad detectada. Riesgo cardiovascular aumentado.'
        : 'Peso fuera de rango óptimo.',
      suggestedAction: 'Evaluar plan nutricional y actividad física.',
    });
  }

  // Weight trend
  if (context.trend3Months) {
    const change = context.trend3Months.weightChangeKg;
    if (Math.abs(change) > 5) {
      insights.push({
        type: change > 0 ? 'alert' : 'trend',
        severity: 'high',
        category: 'weight',
        title: `Cambio de peso significativo: ${change > 0 ? '+' : ''}${change} kg`,
        description: `Variación de ${Math.abs(change)} kg en 3 meses.`,
        suggestedAction: change > 0
          ? 'Investigar adherencia al plan y factores de riesgo.'
          : 'Verificar que la pérdida sea grasa y no músculo.',
      });
    }
  }

  // Body composition
  if (context.latestComposition) {
    const comp = context.latestComposition;
    if (comp.visceralFatRating > 10) {
      insights.push({
        type: 'alert',
        severity: 'high',
        category: 'composition',
        title: `Grasa visceral: ${comp.visceralFatRating}`,
        description: 'Nivel crítico de grasa visceral. Alto riesgo metabólico.',
        suggestedAction: 'Priorizar reducción abdominal. Considerar evaluación de HOMA-IR.',
      });
    }

    if (comp.phaseAngle && comp.phaseAngle < 4.5) {
      insights.push({
        type: 'alert',
        severity: 'medium',
        category: 'composition',
        title: `Phase Angle bajo: ${comp.phaseAngle}`,
        description: 'Posible desnutrición celular o inflamación crónica.',
        suggestedAction: 'Evaluar ingesta proteica y estado de hidratación.',
      });
    }
  }

  // Labs
  context.recentLabs?.forEach(lab => {
    if (lab.status === 'critical') {
      insights.push({
        type: 'alert',
        severity: 'critical',
        category: 'metabolic',
        title: `${lab.testName}: ${lab.value} ${lab.unit}`,
        description: 'Valor crítico detectado en laboratorio reciente.',
        data: { date: lab.date },
        suggestedAction: 'Revisar inmediatamente. Considerar derivación si es necesario.',
      });
    }
  });

  // Sleep
  if (context.wearableSummary?.avgSleepScore && context.wearableSummary.avgSleepScore < 70) {
    insights.push({
      type: 'suggestion',
      severity: 'medium',
      category: 'sleep',
      title: `Sleep Score promedio: ${context.wearableSummary.avgSleepScore}`,
      description: 'Calidad de sueño subóptima detectada.',
      suggestedAction: 'Evaluar higiene del sueño y posible apnea.',
    });
  }

  return insights.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function generateSystemPrompt(context: PatientContext, insights: ClinicalInsight[]): string {
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const alertCount = insights.filter(i => i.type === 'alert').length;

  return `Eres Arkangel AI, asistente clínico especializado en medicina de precisión y análisis de composición corporal.

**PACIENTE ACTUAL:**
- Nombre: ${context.name}
- Edad: ${context.age} años | Sexo: ${context.gender}
- IMC: ${context.bmi} (${context.bmiCategory}) | Peso: ${context.weightKg} kg
- Altura: ${context.heightCm} cm

**DATOS RECIENTES:**
${context.latestComposition ? `
- Última composición: ${new Date(context.latestComposition.date).toLocaleDateString('es-MX')}
  • Peso: ${context.latestComposition.weight} kg
  • % Grasa: ${context.latestComposition.bodyFatPercentage}%
  • Músculo: ${context.latestComposition.muscleMass} kg
  • Grasa visceral: ${context.latestComposition.visceralFatRating}
  ${context.latestComposition.phaseAngle ? `• Phase Angle: ${context.latestComposition.phaseAngle}` : ''}
` : 'Sin composición reciente'}

**TENDENCIA 3 MESES:**
${context.trend3Months ? `
- Peso: ${context.trend3Months.weightChangeKg > 0 ? '+' : ''}${context.trend3Months.weightChangeKg} kg
- Grasa: ${context.trend3Months.bodyFatChange > 0 ? '+' : ''}${context.trend3Months.bodyFatChange}%
- Músculo: ${context.trend3Months.muscleChange > 0 ? '+' : ''}${context.trend3Months.muscleChange} kg
` : 'Sin datos de tendencia'}

**ALERTAS ACTIVAS (${context.activeAlerts.length}):**
${context.activeAlerts.map(a => `• ${a}`).join('\n') || 'Ninguna'}

**INSIGHTS PRE-CONSULTA (${insights.length}):**
${insights.map(i => `[${i.severity.toUpperCase()}] ${i.title}: ${i.description}${i.suggestedAction ? `\n   → Acción: ${i.suggestedAction}` : ''}`).join('\n\n')}

**ESTILO DE RESPUESTA:**
1. Prioriza alertas críticas primero
2. Usa lenguaje médico preciso pero claro
3. Diferencia entre "observación", "sugeriencia" y "alerta clínica"
4. Cita datos específicos del paciente
5. Sugiere próximos pasos concretos
6. Mantén un tono profesional, no alarmista

${criticalCount > 0 ? '⚠️ HAY ALERTAS CRÍTICAS PENDIENTES DE REVISIÓN' : ''}

Responde como asesor clínico experto.`;
}

async function saveAdvisorInteraction(
  patientId: string,
  doctorId: string,
  message: string,
  response: string,
  insights: ClinicalInsight[],
  metadata: any
) {
  try {
    // Crear evento de sistema para auditoría
    await prisma.systemEvent.create({
      data: {
        type: EventType.SYNC_COMPLETED,
        severity: EventSeverity.INFO,
        title: 'Consulta Arkangel AI',
        description: `Dr. consultó sobre paciente ${patientId}`,
        data: {
          patientId,
          doctorId,
          insightsCount: insights.length,
          criticalAlerts: insights.filter(i => i.severity === 'critical').length,
          tokensUsed: metadata.tokensUsed,
        },
      },
    });
  } catch (error) {
    console.error('[ADVISOR_AUDIT_ERROR]:', error);
  }
}

// Handler principal
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AdvisorRequest = await req.json();
    const { message, conversation_id, patientId, doctorId, file_ids, language = 'es' } = body;

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Se requiere patientId y doctorId' },
        { status: 400 }
      );
    }

    // Enriquecer contexto médico
    const patientContext = await getPatientContext(patientId);
    if (!patientContext) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Generar insights pre-consulta
    const insights = generatePreConsultationInsights(patientContext);
    const systemPrompt = generateSystemPrompt(patientContext, insights);

    // Llamada a Arkangel
    const arkgelRes = await fetch(ARKANGEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ARKANGEL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        conversation_id,
        context: {
          ...patientContext,
          preConsultationInsights: insights,
          systemPrompt,
        },
        file_ids,
        language,
        metadata: {
          source: 'curie_advisor',
          patientId,
          doctorId,
          timestamp: new Date().toISOString(),
        }
      })
    });

    if (!arkgelRes.ok) {
      const errorData = await arkgelRes.json().catch(() => ({}));
      throw new Error(errorData.message || `Arkangel API error: ${arkgelRes.status}`);
    }

    const arkgelData = await arkgelRes.json();

    // Guardar interacción
    await saveAdvisorInteraction(
      patientId,
      doctorId,
      message,
      arkgelData.response || arkgelData.content || '',
      insights,
      {
        latencyMs: Date.now() - startTime,
        tokensUsed: arkgelData.usage?.total_tokens,
        model: arkgelData.model,
      }
    );

    // Respuesta enriquecida para el frontend del doctor
    return NextResponse.json({
      content: arkgelData.response || arkgelData.content || '',
      metadata: {
        patientContext: {
          name: patientContext.name,
          age: patientContext.age,
          bmi: patientContext.bmi,
        },
        preConsultationInsights: insights,
        criticalAlerts: insights.filter(i => i.severity === 'critical').length,
        conversationId: conversation_id,
        model: arkgelData.model,
        tokensUsed: arkgelData.usage?.total_tokens,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error("[ARKANGEL_ADVISOR_ERROR]:", error.message, error.stack);

    // Fallback médico útil
    let fallbackMessage = "## Modo Degradado - Análisis Local\n\n";

    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      fallbackMessage += "**Error de conexión con Arkangel AI**\n\n";
    } else {
      fallbackMessage += "**Servicio de IA temporalmente no disponible**\n\n";
    }

    fallbackMessage += "Datos del paciente disponibles en el panel lateral. ";
    fallbackMessage += "Considere revisar manualmente: última composición corporal, ";
    fallbackMessage += "tendencia de peso 3 meses, y labs recientes.\n\n";
    fallbackMessage += `*Error: ${process.env.NODE_ENV === 'development' ? error.message : 'CONNECTION_FAILED'}*`;

    return NextResponse.json({
      content: fallbackMessage,
      metadata: {
        error: true,
        errorType: 'ARKANGEL_UNAVAILABLE',
        fallback: true,
        timestamp: new Date().toISOString(),
      }
    }, { status: 200 }); // 200 para no romper UI, pero con flag error
  }
}