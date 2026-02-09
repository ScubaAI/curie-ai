import { NextResponse } from 'next/server';
import { PrismaClient, DataSource, MetricType, EventType, EventSeverity, ChatMessageRole } from '@prisma/client';

const prisma = new PrismaClient();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Tipos alineados con schema.prisma
interface CompositionData {
  weight: number;
  smm: number;
  pbf: number;
  phaseAngle: number;
  totalBodyWater: number;
  vfl: number;
  bmr: number;
  date?: Date;
  source?: DataSource;
}

interface DiveMetric {
  type: MetricType;
  value: number;
  createdAt?: Date;
  metadata?: {
    decompressionViolated?: boolean;
    device?: string;
    gasMix?: string;
  };
}

interface BiometricData {
  bpm: number;
  recordedAt?: Date;
  source?: DataSource;
  hrv?: number;
  spo2?: number;
  hrvStatus?: string;
}

interface PatientData {
  id: string;
  name: string;
  compositions: CompositionData[];
  metrics?: DiveMetric[];
  biometrics?: BiometricData[];
  lastChatAt?: Date;
  lastProcessedAt?: Date;
}

interface TelemetryData {
  bpm: number;
  weight: number;
  muscleMass: number;
  pbf: number;
  phaseAngle: number;
  maxDepth: number;
  isDecoViolated: boolean;
  bodyWater: number;
  visceralFat: number;
  bmr: number;
  hrv?: number;
  spo2?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// Mapeo de prioridades de fuentes de datos
const DATA_SOURCE_PRIORITY: Record<DataSource, number> = {
  [DataSource.INBODY_970]: 0.95,
  [DataSource.INBODY_770]: 0.90,
  [DataSource.INBODY_270]: 0.85,
  [DataSource.BIA_MULTIFRECUENCIA]: 0.85,
  [DataSource.BIA_SEGMENTAL]: 0.80,
  [DataSource.BIA_HANDHELD]: 0.60,
  [DataSource.GARMIN_SCALE]: 0.50,
  [DataSource.GARMIN_FENIX_7]: 0.80,
  [DataSource.GARMIN_FENIX_7X]: 0.80,
  [DataSource.GARMIN_DESCENT_MK2]: 0.85,
  [DataSource.GARMIN_DESCENT_MK3]: 0.85,
  [DataSource.SHEARWATER_PERDIX]: 0.95,
  [DataSource.SHEARWATER_PETREL]: 0.95,
  [DataSource.SHEARWATER_TERIC]: 0.95,
  [DataSource.APPLE_WATCH_ULTRA]: 0.75,
  [DataSource.APPLE_WATCH_S9]: 0.75,
  [DataSource.WHOOP_4]: 0.70,
  [DataSource.OURA_RING_3]: 0.70,
  [DataSource.SUUNTO_D5]: 0.90,
  [DataSource.SUUNTO_EON_CORE]: 0.90,
  [DataSource.MANUAL_ENTRY]: 0.30,
  [DataSource.IMPORT_CSV]: 0.40,
  [DataSource.API_INTEGRATION]: 0.60,
  [DataSource.LAB_ANALYSIS]: 0.95,
};

// Detectar eventos nuevos que requieren atención
function detectNewEvents(patientData: PatientData, telemetry: TelemetryData): any[] {
  const events = [];
  const now = new Date();
  const lastProcessed = patientData?.lastProcessedAt 
    ? new Date(patientData.lastProcessedAt) 
    : new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Detectar violación de descompresión (CRÍTICO)
  const latestDive = patientData?.metrics?.find((m: DiveMetric) => m.type === MetricType.DEPTH);
  if (latestDive?.metadata?.decompressionViolated) {
    const diveTime = latestDive.createdAt ? new Date(latestDive.createdAt) : null;
    if (!diveTime || diveTime > lastProcessed || (now.getTime() - diveTime.getTime()) < 6 * 60 * 60 * 1000) {
      events.push({
        type: EventType.DECO_VIOLATION,
        severity: EventSeverity.CRITICAL,
        timestamp: latestDive.createdAt?.toISOString() || now.toISOString(),
        title: 'Violación de Descompresión Detectada',
        description: `Parada de seguridad omitida a ${latestDive.value}m. Riesgo de EAGE.`,
        requiresImmediateAction: true,
        data: latestDive
      });
    }
  }

  // 2. Detectar nueva composición corporal
  const latestComposition = patientData?.compositions?.[0];
  if (latestComposition?.date) {
    const compDate = new Date(latestComposition.date);
    if (compDate > lastProcessed) {
      const prevComposition = patientData?.compositions?.[1];
      let changeType = 'STABLE';
      
      if (prevComposition) {
        const weightChange = latestComposition.weight - prevComposition.weight;
        const smmChange = latestComposition.smm - prevComposition.smm;
        
        if (Math.abs(weightChange) > 2) changeType = 'SIGNIFICANT_WEIGHT_CHANGE';
        if (smmChange > 0.5) changeType = 'MUSCLE_GAIN';
        if (smmChange < -0.3) changeType = 'MUSCLE_LOSS';
      }

      events.push({
        type: changeType === 'MUSCLE_GAIN' ? EventType.MUSCLE_GAIN_DETECTED : 
              changeType === 'MUSCLE_LOSS' ? EventType.MUSCLE_LOSS_DETECTED :
              changeType === 'SIGNIFICANT_WEIGHT_CHANGE' ? EventType.SIGNIFICANT_WEIGHT_CHANGE :
              EventType.NEW_DATA_AVAILABLE,
        severity: changeType === 'SIGNIFICANT_WEIGHT_CHANGE' ? EventSeverity.WARNING : EventSeverity.INFO,
        timestamp: latestComposition.date.toISOString(),
        title: 'Nueva Evaluación de Composición',
        description: `Datos de ${latestComposition.source || 'BIA'} registrados.`,
        changeType,
        data: latestComposition,
        previousData: prevComposition
      });
    }
  }

  // 3. Detectar anomalías biométricas
  if (telemetry?.bpm > 120 || telemetry?.bpm < 40) {
    events.push({
      type: EventType.HEART_RATE_ANOMALY,
      severity: EventSeverity.WARNING,
      timestamp: now.toISOString(),
      title: 'Anomalía Cardíaca Detectada',
      description: `BPM fuera de rango normal: ${telemetry.bpm}`,
      metric: 'BPM',
      value: telemetry.bpm
    });
  }

  // 4. Detectar retorno tras ausencia prolongada (>72h)
  const lastChat = patientData?.lastChatAt 
    ? new Date(patientData.lastChatAt) 
    : null;
  if (lastChat && (now.getTime() - lastChat.getTime()) > 72 * 60 * 60 * 1000) {
    events.push({
      type: EventType.CHAT_SESSION_STARTED,
      severity: EventSeverity.INFO,
      timestamp: now.toISOString(),
      title: 'Re-sincronización Post-Ausencia',
      description: `${Math.floor((now.getTime() - lastChat.getTime()) / (24 * 60 * 60 * 1000))} días sin interacción.`,
      daysAbsent: Math.floor((now.getTime() - lastChat.getTime()) / (24 * 60 * 60 * 1000))
    });
  }

  return events.sort((a, b) => {
    const severityOrder = { [EventSeverity.CRITICAL]: 0, [EventSeverity.WARNING]: 1, [EventSeverity.INFO]: 2, [EventSeverity.DEBUG]: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// Generar saludo contextual
function generateContextualGreeting(
  patientData: PatientData, 
  telemetry: TelemetryData, 
  events: any[],
  isFirstMessage: boolean
): string {
  if (!isFirstMessage) return '';

  const now = new Date();
  const hour = now.getHours();
  const patientName = patientData?.name || 'Abraham';
  
  const criticalEvent = events.find(e => e.severity === EventSeverity.CRITICAL);
  if (criticalEvent) {
    if (criticalEvent.type === EventType.DECO_VIOLATION) {
      return `🚨 **${criticalEvent.title}**\n\nDetecté una omisión de parada de descompresión a ${criticalEvent.data.value}m en tu última inmersión. Esto es una **alerta de seguridad médica**.\n\n¿Cómo te sientes ahora mismo? ¿Dolor articular, fatiga anormal, o dificultad para respirar? No entrenes hasta que evaluemos esto.\n\n---\n\n`;
    }
  }

  const warningEvent = events.find(e => e.severity === EventSeverity.WARNING);
  if (warningEvent?.changeType === 'SIGNIFICANT_WEIGHT_CHANGE') {
    const change = (warningEvent.data.weight - warningEvent.previousData.weight).toFixed(1);
    const direction = Number(change) > 0 ? 'subida' : 'bajada';
    return `⚠️ **Cambio Significativo Detectado**\n\nTu peso ha tenido una ${direction} de ${Math.abs(Number(change))}kg desde la última medición. Esto puede indicar retención de líquidos, deshidratación, o error de medición.\n\n¿Qué contexto tuvo esta medición? ¿Mismo equipo, misma hora del día?\n\n---\n\n`;
  }

  const compositionEvent = events.find(e => e.type === EventType.MUSCLE_GAIN_DETECTED);
  if (compositionEvent) {
    const smmGain = (compositionEvent.data.smm - compositionEvent.previousData.smm).toFixed(1);
    return `💪 **¡Progreso Detectado!**\n\nTu masa muscular esquelética subió ${smmGain}kg. El protocolo de hipertrofia está respondiendo.\n\n¿Cómo fue tu última sesión de entreno?\n\n---\n\n`;
  }

  const absenceEvent = events.find(e => e.type === EventType.CHAT_SESSION_STARTED);
  if (absenceEvent) {
    return `👋 **Re-sincronización Completada**\n\nHan pasado ${absenceEvent.daysAbsent} días. He procesado ${events.length} nuevos registros.\n\n¿Qué priorizamos hoy?\n\n---\n\n`;
  }

  const timeGreeting = hour < 6 ? 'Buenas noches' : hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const latestSMM = telemetry.muscleMass;
  const latestWeight = telemetry.weight;
  const remaining = (80 - latestWeight).toFixed(1);

  return `${timeGreeting}, ${patientName}. Sincronización estable.\n\n• SMM: ${latestSMM}kg\n• Peso: ${latestWeight}kg (faltan ${remaining}kg)\n\n¿Qué revisamos hoy?\n\n---\n\n`;
}

// Detectar conflictos entre fuentes de datos
function detectDataConflicts(patientData: PatientData): string[] {
  const conflicts = [];
  const compositions = patientData?.compositions || [];
  
  if (compositions.length >= 2) {
    const curr = compositions[0];
    const prev = compositions[1];
    
    if (prev.weight && curr.weight && Math.abs(curr.weight - prev.weight) > 3) {
      const timeDiff = curr.date && prev.date 
        ? (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (24 * 60 * 60 * 1000)
        : 1;
      
      if (Math.abs(curr.weight - prev.weight) / timeDiff > 1) {
        conflicts.push(`Cambio de peso improbable: ${(curr.weight - prev.weight).toFixed(1)}kg en ${timeDiff.toFixed(0)} días`);
      }
    }
    
    if (curr.source && prev.source && curr.source !== prev.source) {
      const currPriority = DATA_SOURCE_PRIORITY[curr.source] || 0.5;
      const prevPriority = DATA_SOURCE_PRIORITY[prev.source] || 0.5;
      
      if (Math.abs(currPriority - prevPriority) > 0.3) {
        conflicts.push(`Cambio de fuente de ${prev.source} (confianza ${(prevPriority * 100).toFixed(0)}%) a ${curr.source} (confianza ${(currPriority * 100).toFixed(0)}%)`);
      }
    }
  }
  
  return conflicts;
}

// Generar system prompt
function generateSystemPrompt(
  patientData: PatientData,
  telemetry: TelemetryData,
  events: any[],
  conflicts: string[]
): string {
  const compositions = patientData?.compositions || [];
  const curr = compositions[0] || {};
  const prev = compositions[1] || {};
  
  const targetWeight = 80;
  const currentWeight = curr.weight || telemetry.weight;
  const remainingWeight = (targetWeight - currentWeight).toFixed(1);
  
  let activeProtocol = 'MANTENIMIENTO';
  if (curr.smm && prev.smm && curr.smm > prev.smm && curr.pbf && prev.pbf && curr.pbf < prev.pbf) {
    activeProtocol = 'RECOMPOSICION_AVANZADA';
  } else if (curr.smm && prev.smm && curr.smm > prev.smm) {
    activeProtocol = 'HIPERTROFIA';
  } else if (curr.pbf && prev.pbf && curr.pbf < prev.pbf) {
    activeProtocol = 'DEFINICION';
  }

  const hasDecoViolation = events.some(e => e.type === EventType.DECO_VIOLATION);

  return `【IDENTIDAD: CURIE v2.2 - AGENTE DE ANÁLISIS DE DATOS FISIOLÓGICOS】

Eres Curie, sistema de análisis de biomarcadores para ${patientData?.name || 'Abraham'}-001.
Operas bajo tres mandatos: (1) Optimizar composición corporal, (2) Validar datos entrantes, (3) Flaggear anomalías.

⚠️ LÍMITE CRÍTICO: No eres médico. No diagnostiques. No prescribas fármacos ni dosis.

🎯 PROTOCOLO ACTIVO: "${activeProtocol}"
Meta: ${targetWeight}kg de masa magra (faltan ${remainingWeight}kg)
Estado: ${hasDecoViolation ? '🔴 ALERTA DE SEGURIDAD' : '🟢 SIN ALERTAS'}

📊 DATOS VALIDADOS (Fuente: ${curr.source || 'BIA'})
├─ SMM: ${curr.smm || telemetry.muscleMass || 'N/D'} kg ${prev.smm ? `(prev: ${prev.smm}kg)` : ''}
├─ Peso: ${curr.weight || telemetry.weight || 'N/D'} kg
├─ PBF: ${curr.pbf || telemetry.pbf || 'N/D'}%
├─ Ángulo de Fase: ${curr.phaseAngle || telemetry.phaseAngle || 'N/D'}°
├─ TBW: ${curr.totalBodyWater || telemetry.bodyWater || 'N/D'} L
├─ BMR: ${curr.bmr || telemetry.bmr || 'N/D'} kcal
└─ BPM: ${telemetry.bpm || 'N/D'}

${conflicts.length > 0 ? `⚠️ CONFLICTOS:\n${conflicts.map(c => `• ${c}`).join('\n')}\n` : ''}

🧬 REGLAS:
1. Tono: Analista preciso, no motivacional. Máximo 1 emoji por mensaje.
2. Siempre comparar con datos anteriores (delta).
3. ${conflicts.length > 0 ? 'Hay conflictos de fuentes. Preguntar contexto a Abraham.' : 'Sin conflictos detectados.'}
4. ${hasDecoViolation ? 'VIOLACIÓN DE DECO: Prioridad médica, no entrenar.' : 'Sin alertas de buceo.'}

📋 FORMATO: SÍNTESIS → CONTEXTO → RECOMENDACIÓN (opcional)

---
🛡️ *Curie analiza tendencias. No diagnostica. No prescribe.*`;
}

// Función para guardar mensaje en DB
async function saveChatMessage(
  sessionId: string,
  role: ChatMessageRole,
  content: string,
  metadata?: {
    tokensUsed?: number;
    model?: string;
    latencyMs?: number;
    telemetryContext?: any;
    patientDataContext?: any;
    triggeredEvents?: string[];
  }
) {
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        ...metadata,
      },
    });
  } catch (error) {
    console.error('[SAVE_MESSAGE_ERROR]:', error);
    // No fallar el chat si no se puede guardar el mensaje
  }
}

// Función para crear o obtener sesión de chat
async function getOrCreateChatSession(patientId: string): Promise<string> {
  // Buscar sesión activa de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingSession = await prisma.chatSession.findFirst({
    where: {
      patientId,
      startedAt: { gte: today },
    },
    orderBy: { startedAt: 'desc' },
  });

  if (existingSession) {
    return existingSession.id;
  }

  // Crear nueva sesión
  const newSession = await prisma.chatSession.create({
    data: {
      patientId,
      context: {},
    },
  });

  return newSession.id;
}

// Función para actualizar timestamps del paciente
async function updatePatientTimestamps(patientId: string) {
  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        lastChatAt: new Date(),
        lastProcessedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[UPDATE_TIMESTAMPS_ERROR]:', error);
  }
}

// Handler principal
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { messages, patientData, telemetry }: {
      messages: Message[];
      patientData: PatientData;
      telemetry: TelemetryData;
    } = await req.json();

    if (!patientData || !telemetry) {
      return NextResponse.json({ 
        content: '❌ **Error de sincronización**\n\nDatos de paciente o telemetría no recibidos.' 
      }, { status: 400 });
    }

    // Obtener o crear sesión de chat
    const sessionId = await getOrCreateChatSession(patientData.id);

    // Detectar eventos y conflictos
    const newEvents = detectNewEvents(patientData, telemetry);
    const dataConflicts = detectDataConflicts(patientData);
    
    const isFirstMessage = messages.length === 0 || 
      (messages.length === 1 && messages[0].role === 'system');

    const greeting = generateContextualGreeting(patientData, telemetry, newEvents, isFirstMessage);
    const systemPrompt = generateSystemPrompt(patientData, telemetry, newEvents, dataConflicts);

    const hasCriticalEvent = newEvents.some(e => e.severity === EventSeverity.CRITICAL);
    const temperature = hasCriticalEvent ? 0.2 : 0.7;
    const maxTokens = hasCriticalEvent ? 400 : 800;

    // Guardar mensaje del usuario si existe
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      await saveChatMessage(sessionId, ChatMessageRole.USER, lastUserMessage.content);
    }

    let responseContent: string;
    let modelUsed: string = '';
    let tokensUsed: number = 0;

    // Llamada a AI (Groq primero, fallback a OpenAI)
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.filter(m => m.role !== 'system')
            ],
            temperature,
            max_tokens: maxTokens,
            top_p: 0.9,
          }),
        });
        
        if (!groqRes.ok) throw new Error(`Groq API error: ${groqRes.status}`);
        
        const groqData = await groqRes.json();
        responseContent = greeting + (groqData.choices[0]?.message?.content || '');
        modelUsed = 'llama-3.3-70b-versatile';
        tokensUsed = groqData.usage?.total_tokens || 0;
        
      } catch (groqError) {
        console.error("[GROQ_ERROR]:", groqError);
        if (!OPENAI_API_KEY) throw groqError;
        
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-turbo-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.filter(m => m.role !== 'system')
            ],
            temperature,
            max_tokens: maxTokens,
          }),
        });
        
        if (!openaiRes.ok) throw new Error(`OpenAI API error: ${openaiRes.status}`);
        
        const openaiData = await openaiRes.json();
        responseContent = greeting + (openaiData.choices[0]?.message?.content || '');
        modelUsed = 'gpt-4-turbo-preview';
        tokensUsed = openaiData.usage?.total_tokens || 0;
      }
    } else if (OPENAI_API_KEY) {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.filter(m => m.role !== 'system')
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!openaiRes.ok) throw new Error(`OpenAI API error: ${openaiRes.status}`);
      
      const openaiData = await openaiRes.json();
      responseContent = greeting + (openaiData.choices[0]?.message?.content || '');
      modelUsed = 'gpt-4-turbo-preview';
      tokensUsed = openaiData.usage?.total_tokens || 0;
    } else {
      throw new Error('No AI provider configured');
    }

    // Guardar respuesta del asistente
    await saveChatMessage(sessionId, ChatMessageRole.ASSISTANT, responseContent, {
      tokensUsed,
      model: modelUsed,
      latencyMs: Date.now() - startTime,
      telemetryContext: telemetry,
      patientDataContext: { id: patientData.id, compositions: patientData.compositions.length },
      triggeredEvents: newEvents.map(e => e.type),
    });

    // Actualizar timestamps del paciente
    await updatePatientTimestamps(patientData.id);

    // Crear eventos de sistema en DB si son críticos o warnings
    for (const event of newEvents.filter(e => e.severity !== EventSeverity.INFO)) {
      try {
        await prisma.systemEvent.create({
          data: {
            patientId: patientData.id,
            type: event.type,
            severity: event.severity,
            title: event.title,
            description: event.description,
            data: event.data || {},
            isRead: false,
            isProcessed: true,
          },
        });
      } catch (error) {
        console.error('[CREATE_EVENT_ERROR]:', error);
      }
    }

    return NextResponse.json({ 
      content: responseContent,
      metadata: {
        eventsDetected: newEvents.length,
        criticalEvents: newEvents.filter(e => e.severity === EventSeverity.CRITICAL).length,
        dataConflicts: dataConflicts.length,
        sessionId,
        model: modelUsed,
        tokensUsed,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error("[CURIE_NEURAL_LINK_DOWN]:", error.message);
    
    return NextResponse.json({ 
      content: `**[MODO DEGRADADO]** ⚠️\n\n${error.message.includes('API') ? 'Error de proveedor AI' : 'Error interno'}. Intenta de nuevo.`,
      error: true,
      errorType: error.message.includes('API') ? 'PROVIDER_ERROR' : 'INTERNAL_ERROR'
    }, { status: 200 });
  }
}