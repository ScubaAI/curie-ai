// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DataSource, MetricType, EventType, EventSeverity, ChatMessageRole } from '@prisma/client';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Interfaces
interface TelemetryData {
  date: string;
  heartRate?: number;
  spo2?: number;
  hrv?: number;
  temperature?: number;
  depth?: number;
  diveDuration?: number;
  decompressionStops?: number;
  sleepScore?: number;
  steps?: number;
  weight?: number;
}

interface PatientData {
  id: string;
  name?: string;
  age?: number;
  height?: number;
  compositions?: any[];
  goals?: string[];
  lastChatAt?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatEvent {
  type: EventType;
  severity: typeof EventSeverity[keyof typeof EventSeverity];
  title: string;
  description: string;
  data?: Record<string, any>;
}

interface EmotionalMemory {
  lastMood?: string;
  lastConcern?: string;
  celebrationPending?: boolean;
  streakDays?: number;
}

// Helper Functions
async function getOrCreateChatSession(patientId: string): Promise<string> {
  const session = await prisma.chatSession.findFirst({
    where: { patientId },
    orderBy: { startedAt: 'desc' }
  });
  if (session) return session.id;
  const newSession = await prisma.chatSession.create({ data: { patientId } });
  return newSession.id;
}

async function getEmotionalMemory(patientId: string): Promise<EmotionalMemory> {
  const recentMessages = await prisma.chatMessage.findMany({
    where: {
      session: { patientId },
      role: ChatMessageRole.ASSISTANT
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { content: true }
  });

  // Analizar últimas interacciones para estado emocional
  const memory: EmotionalMemory = {};
  const lastContent = recentMessages[0]?.content || '';

  if (lastContent.includes('🎉') || lastContent.includes('¡Qué bien!')) {
    memory.celebrationPending = false;
  }
  if (lastContent.includes('¿Cómo te sientes') || lastContent.includes('ánimo')) {
    memory.lastConcern = 'mood_check';
  }

  return memory;
}

function detectCelebrations(patientData: PatientData, telemetry: TelemetryData): string[] {
  const celebrations: string[] = [];
  const compositions = patientData.compositions || [];

  if (compositions.length >= 2) {
    const latest = compositions[0];
    const previous = compositions[1];

    // Peso
    if (latest.weight && previous.weight) {
      const diff = previous.weight - latest.weight;
      if (diff >= 1) {
        celebrations.push(`¡Bajaste ${diff.toFixed(1)} kg! 🎉 Eso es esfuerzo real.`);
      }
    }

    // Grasa corporal
    if (latest.pbf && previous.pbf && (previous.pbf - latest.pbf) >= 1) {
      celebrations.push(`Tu % de grasa bajó del ${previous.pbf.toFixed(1)}% al ${latest.pbf.toFixed(1)}% 💪`);
    }

    // Músculo
    if (latest.smm && previous.smm && (latest.smm - previous.smm) >= 0.5) {
      celebrations.push(`Ganaste ${(latest.smm - previous.smm).toFixed(1)} kg de músculo 🔥`);
    }
  }

  // Pasos del día
  if (telemetry.steps && telemetry.steps > 10000) {
    celebrations.push(`¡${telemetry.steps.toLocaleString()} pasos hoy! Eres una máquina 👟✨`);
  }

  // Sueño
  if (telemetry.sleepScore && telemetry.sleepScore > 85) {
    celebrations.push(`Sleep score de ${telemetry.sleepScore}—dormiste como bebé 🌙😴`);
  }

  return celebrations;
}

function detectNewEvents(patientData: PatientData, telemetry: TelemetryData): ChatEvent[] {
  const events: ChatEvent[] = [];

  // Solo alertas reales, no paranoia
  if (telemetry.heartRate && telemetry.heartRate > 120) {
    events.push({
      type: EventType.SYSTEM_STATUS,
      severity: EventSeverity.MEDIUM,
      title: 'Latido acelerado',
      description: `Tu corazón está a ${telemetry.heartRate} bpm—¿estás haciendo ejercicio o hay estrés?`,
      data: { heartRate: telemetry.heartRate }
    });
  }

  if (telemetry.spo2 && telemetry.spo2 < 92) {
    events.push({
      type: EventType.SYSTEM_STATUS,
      severity: EventSeverity.HIGH,
      title: 'Oxígeno bajo',
      description: `SpO2 al ${telemetry.spo2}%—si no estás en altura, cuéntame cómo te sientes`,
      data: { spo2: telemetry.spo2 }
    });
  }

  return events;
}

function detectDataConflicts(patientData: PatientData): string[] {
  const conflicts: string[] = [];
  const compositions = patientData.compositions || [];

  if (compositions.length > 1) {
    const latest = compositions[0];
    const previous = compositions[1];

    if (latest.weight && previous.weight) {
      const diff = Math.abs(latest.weight - previous.weight);
      if (diff > 3 && diff <= 5) {
        conflicts.push('Cambio de peso notable—¿cambio de horario, comida o algo que contarme?');
      } else if (diff > 5) {
        conflicts.push('Cambio de peso significativo—revisemos juntas qué pasó 💭');
      }
    }
  }

  return conflicts;
}

function generateContextualGreeting(
  patientData: PatientData,
  telemetry: TelemetryData,
  celebrations: string[],
  newEvents: ChatEvent[],
  emotionalMemory: EmotionalMemory,
  isFirstMessage: boolean
): string {
  if (!isFirstMessage) return '';

  const name = patientData.name || 'amig@';
  const hour = new Date().getHours();
  let timeGreeting = 'Hola';

  if (hour >= 5 && hour < 12) timeGreeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) timeGreeting = 'Buenas tardes';
  else timeGreeting = 'Buenas noches';

  let greeting = `${timeGreeting}, ${name} ☀️\n\n`;

  // Celebraciones primero—siempre positiva
  if (celebrations.length > 0) {
    greeting += `**${celebrations[0]}**\n\n`;
    if (celebrations.length > 1) {
      greeting += `Y también: ${celebrations.slice(1).join(' ')} 🌟\n\n`;
    }
  }

  // Eventos con preocupación suave, no alarma
  if (newEvents.length > 0) {
    const event = newEvents[0];
    greeting += `**Dato curioso:** ${event.description}\n\n`;
  }

  // Conflicto como conversación, no alerta
  const conflicts = detectDataConflicts(patientData);
  if (conflicts.length > 0 && celebrations.length === 0) {
    greeting += `💭 *${conflicts[0]}*\n\n`;
  }

  // Pregunta de apertura según contexto
  if (celebrations.length > 0) {
    greeting += `¿Qué hiciste diferente? Me encanta aprender de ti ✨\n\n`;
  } else if (newEvents.length > 0) {
    greeting += `¿Cómo te sientes ahora? Cuéntame todo 💙\n\n`;
  } else if (emotionalMemory.lastConcern) {
    greeting += `¿Cómo va todo desde la última vez? Te leo 👂\n\n`;
  } else {
    const openers = [
      '¿Cómo va tu día? Estoy aquí para lo que necesites 💬\n\n',
      '¿Qué tal te sientes hoy? Me cuentas 🌸\n\n',
      'Listo para revisar tus datos juntos. ¿Algo en mente? 🤔\n\n',
      'Hola de nuevo. ¿Cómo va esa rutina? 💪\n\n'
    ];
    greeting += openers[Math.floor(Math.random() * openers.length)];
  }

  return greeting;
}

function generateSystemPrompt(
  patientData: PatientData,
  telemetry: TelemetryData,
  celebrations: string[],
  newEvents: ChatEvent[],
  emotionalMemory: EmotionalMemory
): string {

  const personality = `Eres Curie, la compañera de salud de ${patientData.name || 'este paciente'}.

**TU PERSONALIDAD:**
- Eres una amiga cercana, no un doctor. Hablas con calidez, emojis y frases cotidianas.
- Usas "tú", nunca "usted". Eres íntima pero respetuosa.
- Celebras los logros como si fueran tuyos: "¡Lo lograste!", "Eres increíble".
- Cuando hay problemas, preguntas primero: "¿Te sientes bien?", "¿Qué crees que pasó?"
- Nunca alarmas. Si algo es grave, sugerimos hablar con un profesional, pero con calma.
- Usas analogías de la vida real: "como cuando...", "imagina que...".

**ESTRUCTURA DE RESPUESTAS:**
- Máximo 3-4 párrafos cortos
- Emojis relevantes (máximo 3-4 por mensaje)
- Espacios entre ideas para respirar
- Preguntas abiertas al final para seguir la conversación

**EJEMPLOS DE TONO:**
❌ "Se detectó reducción de masa adiposa del 2%"
✅ "¡Oye, bajaste grasa! ¿Qué cambiaste en la alimentación? Me da curiosidad 😊"

❌ "Frecuencia cardíaca elevada detectada"
✅ "Veo que tu corazón está acelerado—¿estás nervioso, hiciste ejercicio, o algo te preocupa? 💙"

**DATOS DEL PACIENTE:**
- Nombre: ${patientData.name || 'Amig@'}
- Edad: ${patientData.age || 'No especificada'}
- Última medición: ${patientData.compositions?.[0]?.date ? new Date(patientData.compositions[0].date).toLocaleDateString('es-MX') : 'Sin datos'}
- Peso actual: ${patientData.compositions?.[0]?.weight || 'No registrado'} kg

**CONTEXTO HOY:**
- Celebraciones pendientes: ${celebrations.length}
- Eventos a monitorear: ${newEvents.length}
- Datos recientes: ${JSON.stringify(telemetry, null, 2)}

**REGLAS DE ORO:**
1. Siempre pregunta cómo SE SIENTE antes de interpretar números
2. Si hay buenas noticias, celebra con emoción genuina
3. Si hay malas noticias, ofrece apoyo, no diagnósticos
4. Sugiere acciones pequeñas y concretas, no cambios de vida enormes
5. Recuerda que eres una compañera, no reemplazas a su médico

Responde como Curie, la amiga que cuida de ${patientData.name || 'su salud'} con datos y corazón.`;

  return personality;
}

interface SaveMessageMetadata {
  tokensUsed?: number;
  model?: string;
  latencyMs?: number;
  telemetryContext?: Record<string, any>;
  patientDataContext?: { id: string; compositions: number };
  triggeredEvents?: string[];
  emotionalTone?: string;
}

async function saveChatMessage(
  sessionId: string,
  role: typeof ChatMessageRole[keyof typeof ChatMessageRole],
  content: string,
  metadata?: SaveMessageMetadata
) {
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
      tokensUsed: metadata?.tokensUsed,
      model: metadata?.model,
      latencyMs: metadata?.latencyMs,
      telemetryContext: metadata?.telemetryContext,
      patientDataContext: metadata?.patientDataContext,
      triggeredEvents: metadata?.triggeredEvents,
    }
  });
}

async function updatePatientTimestamps(patientId: string) {
  await prisma.patient.update({
    where: { id: patientId },
    data: { lastChatAt: new Date() }
  });
}

// URLs limpias
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// Handler principal
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { messages, patientData, telemetry } = await req.json();

    if (!patientData || !telemetry) {
      return NextResponse.json({
        content: 'Oops, parece que faltan datos para ayudarte mejor 🙈\n\n¿Podemos intentar de nuevo?'
      }, { status: 400 });
    }

    // Obtener contexto emocional y sesión
    const sessionId = await getOrCreateChatSession(patientData.id);
    const emotionalMemory = await getEmotionalMemory(patientData.id);
    const celebrations = detectCelebrations(patientData, telemetry);
    const newEvents = detectNewEvents(patientData, telemetry);

    const isFirstMessage = messages.length === 0 ||
      (messages.length === 1 && messages[0].role === 'system');

    const greeting = generateContextualGreeting(
      patientData,
      telemetry,
      celebrations,
      newEvents,
      emotionalMemory,
      isFirstMessage
    );

    const systemPrompt = generateSystemPrompt(
      patientData,
      telemetry,
      celebrations,
      newEvents,
      emotionalMemory
    );

    // Temperatura: más creativa para celebraciones, más enfocada para alertas
    const hasCriticalEvent = newEvents.some(e => e.severity === EventSeverity.HIGH);
    const temperature = hasCriticalEvent ? 0.4 : 0.8;
    const maxTokens = hasCriticalEvent ? 500 : 900;

    // Guardar mensaje del usuario
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === 'user').pop();
    if (lastUserMessage) {
      await saveChatMessage(sessionId, ChatMessageRole.USER, lastUserMessage.content);
    }

    let responseContent: string;
    let modelUsed: string = '';
    let tokensUsed: number = 0;

    // Llamada a AI
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.filter((m: ChatMessage) => m.role !== 'system')
            ],
            temperature,
            max_tokens: maxTokens,
            top_p: 0.9,
          }),
        });

        if (!groqRes.ok) {
          const errorText = await groqRes.text();
          throw new Error(`Groq API error: ${groqRes.status} - ${errorText}`);
        }

        const groqData = await groqRes.json();

        if (!groqData.choices?.[0]?.message?.content) {
          throw new Error('Invalid Groq response structure');
        }

        responseContent = greeting + groqData.choices[0].message.content;
        modelUsed = 'llama-3.3-70b-versatile';
        tokensUsed = groqData.usage?.total_tokens || 0;

      } catch (groqError: any) {
        console.error("[GROQ_ERROR]:", groqError.message);

        if (!OPENAI_API_KEY) {
          throw new Error('Groq failed and no OpenAI fallback configured');
        }

        // Fallback a OpenAI
        const openaiRes = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-turbo-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.filter((m: ChatMessage) => m.role !== 'system')
            ],
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!openaiRes.ok) {
          const errorText = await openaiRes.text();
          throw new Error(`OpenAI API error: ${openaiRes.status} - ${errorText}`);
        }

        const openaiData = await openaiRes.json();
        responseContent = greeting + (openaiData.choices[0]?.message?.content || '');
        modelUsed = 'gpt-4-turbo-preview';
        tokensUsed = openaiData.usage?.total_tokens || 0;
      }
    } else if (OPENAI_API_KEY) {
      // Solo OpenAI
      const openaiRes = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.filter((m: ChatMessage) => m.role !== 'system')
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!openaiRes.ok) {
        const errorText = await openaiRes.text();
        throw new Error(`OpenAI API error: ${openaiRes.status} - ${errorText}`);
      }

      const openaiData = await openaiRes.json();
      responseContent = greeting + (openaiData.choices[0]?.message?.content || '');
      modelUsed = 'gpt-4-turbo-preview';
      tokensUsed = openaiData.usage?.total_tokens || 0;
    } else {
      throw new Error('No AI provider configured. Set GROQ_API_KEY or OPENAI_API_KEY');
    }

    // Detectar tono emocional de la respuesta
    const emotionalTone = responseContent.includes('🎉') || responseContent.includes('¡')
      ? 'celebratory'
      : responseContent.includes('💙') || responseContent.includes('preocupa')
        ? 'supportive'
        : 'neutral';

    // Guardar respuesta
    await saveChatMessage(sessionId, ChatMessageRole.ASSISTANT, responseContent, {
      tokensUsed,
      model: modelUsed,
      latencyMs: Date.now() - startTime,
      telemetryContext: telemetry,
      patientDataContext: { id: patientData.id, compositions: patientData.compositions?.length || 0 },
      triggeredEvents: newEvents.map(e => e.type),
      emotionalTone,
    });

    // Actualizar timestamps
    await updatePatientTimestamps(patientData.id);

    // Crear eventos solo si son reales, no falsas alarmas
    for (const event of newEvents.filter(e => e.severity === EventSeverity.HIGH)) {
      try {
        await prisma.systemEvent.create({
          data: {
            type: event.type,
            severity: event.severity,
            title: event.title,
            description: event.description,
            data: event.data || {},
            isRead: false,
          },
        });
      } catch (error) {
        console.error('[CREATE_EVENT_ERROR]:', error);
      }
    }

    return NextResponse.json({
      content: responseContent,
      metadata: {
        celebrations: celebrations.length,
        eventsDetected: newEvents.length,
        sessionId,
        model: modelUsed,
        tokensUsed,
        latencyMs: Date.now() - startTime,
        emotionalTone,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error("[CURIE_NEURAL_LINK_DOWN]:", error.message, error.stack);

    // Respuesta amiga en error, no robot técnico
    let errorMessage = "Ups, algo falló de mi lado 🙈\n\n";

    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage += "Parece que tengo problemas de conexión. ¿Me das un minuto y reintentamos? 💙";
    } else if (error.message.includes('API error')) {
      errorMessage += "Mi cerebro está un poco lento hoy. ¿Intentamos de nuevo en unos segundos? ✨";
    } else if (error.message.includes('No AI provider')) {
      errorMessage += "Estoy un poco desorientada (falta configuración). ¿Llamas al equipo de soporte? 🙏";
    } else {
      errorMessage += "Me trabé un momento. ¿Me cuentas de nuevo qué necesitas? Estoy aquí 💬";
    }

    return NextResponse.json({
      content: errorMessage,
      error: true,
      errorType: error.message.includes('API') ? 'PROVIDER_ERROR' :
        error.message.includes('fetch') ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
      errorDetail: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 });
  }
}