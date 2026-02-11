// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ✅ Singleton
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
}

interface PatientData {
  id: string;
  name?: string;
  age?: number;
  compositions?: any[];
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

function detectNewEvents(patientData: PatientData, telemetry: TelemetryData): ChatEvent[] {
  const events: ChatEvent[] = [];
  
  if (telemetry.heartRate && telemetry.heartRate > 100) {
    events.push({
      type: EventType.HEART_RATE_ANOMALY,
      severity: EventSeverity.WARNING,
      title: 'Frecuencia cardíaca elevada',
      description: `Heart rate: ${telemetry.heartRate} bpm`,
      data: { heartRate: telemetry.heartRate }
    });
  }
  
  if (telemetry.spo2 && telemetry.spo2 < 95) {
    events.push({
      type: EventType.SPO2_CRITICAL,
      severity: EventSeverity.WARNING,
      title: 'Saturación de oxígeno baja',
      description: `SpO2: ${telemetry.spo2}%`,
      data: { spo2: telemetry.spo2 }
    });
  }
  
  return events;
}

function detectDataConflicts(patientData: PatientData): string[] {
  const conflicts: string[] = [];
  // Basic conflict detection logic
  if (patientData.compositions && patientData.compositions.length > 1) {
    const latest = patientData.compositions[0];
    const previous = patientData.compositions[1];
    if (latest && previous) {
      if (latest.weight && previous.weight && Math.abs(latest.weight - previous.weight) > 5) {
        conflicts.push('Cambio significativo de peso entre mediciones');
      }
    }
  }
  return conflicts;
}

function generateContextualGreeting(
  patientData: PatientData, 
  telemetry: TelemetryData, 
  newEvents: ChatEvent[], 
  isFirstMessage: boolean
): string {
  if (!isFirstMessage) return '';
  
  let greeting = `**Bienvenido al Panel de Análisis de ${patientData.name || 'Paciente'}**\n\n`;
  greeting += `He detectado ${newEvents.length} evento(s) que requieren atención.\n\n`;
  
  if (newEvents.length > 0) {
    greeting += '**Eventos detectados:**\n';
    newEvents.forEach(e => {
      greeting += `• ${e.title}: ${e.description}\n`;
    });
    greeting += '\n';
  }
  
  greeting += '¿En qué puedo ayudarte con el análisis de datos?';
  return greeting;
}

function generateSystemPrompt(
  patientData: PatientData, 
  telemetry: TelemetryData, 
  newEvents: ChatEvent[], 
  dataConflicts: string[]
): string {
  return `Eres un asistente médico especializado en análisis de datos de composición corporal y telemetría.

Rol: Asesor de composición corporal y optimización de salud.

Paciente ID: ${patientData.id}
Paciente Edad: ${patientData.age || 'No especificada'}

Eventos críticos: ${newEvents.length}
Conflictos de datos: ${dataConflicts.length}

Instrucciones:
- Responde en español
- Proporciona análisis basados en datos cuando sea posible
- Sugiere acciones concretas para mejorar métricas
- Si detectas anomalías, recomienda consultar con profesional médico

 Contexto de telemetría: ${JSON.stringify(telemetry)}`;
}

interface SaveMessageMetadata {
  tokensUsed?: number;
  model?: string;
  latencyMs?: number;
  telemetryContext?: Record<string, any>;
  patientDataContext?: { id: string; compositions: number };
  triggeredEvents?: string[];
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

// URLs corregidas (sin espacios)
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ... resto de funciones ...

// Handler principal
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { messages, patientData, telemetry } = await req.json();

    if (!patientData || !telemetry) {
      return NextResponse.json({ 
        content: '❌ **Error de sincronización**\n\nDatos de paciente o telemetría no recibidos.' 
      }, { status: 400 });
    }

    // Obtener o crear sesión de chat
    const sessionId = await getOrCreateChatSession(patientData.id);
    const newEvents = detectNewEvents(patientData, telemetry);
    const dataConflicts = detectDataConflicts(patientData);
    
    const isFirstMessage = messages.length === 0 || 
      (messages.length === 1 && messages[0].role === 'system');

    const greeting = generateContextualGreeting(patientData, telemetry, newEvents, isFirstMessage);
    const systemPrompt = generateSystemPrompt(patientData, telemetry, newEvents, dataConflicts);

    const hasCriticalEvent = newEvents.some(e => e.severity === EventSeverity.CRITICAL);
    const temperature = hasCriticalEvent ? 0.2 : 0.7;
    const maxTokens = hasCriticalEvent ? 400 : 800;

    // Guardar mensaje del usuario
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === 'user').pop();
    if (lastUserMessage) {
      await saveChatMessage(sessionId, ChatMessageRole.USER, lastUserMessage.content);
    }

    let responseContent: string;
    let modelUsed: string = '';
    let tokensUsed: number = 0;

    // Llamada a AI con URLs corregidas
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch(GROQ_URL, { // ✅ URL sin espacio
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
        const openaiRes = await fetch(OPENAI_URL, { // ✅ URL sin espacio
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

    // Guardar respuesta
    await saveChatMessage(sessionId, ChatMessageRole.ASSISTANT, responseContent, {
      tokensUsed,
      model: modelUsed,
      latencyMs: Date.now() - startTime,
      telemetryContext: telemetry,
      patientDataContext: { id: patientData.id, compositions: patientData.compositions?.length || 0 },
      triggeredEvents: newEvents.map(e => e.type),
    });

    // Actualizar timestamps
    await updatePatientTimestamps(patientData.id);

    // Crear eventos críticos
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
    console.error("[CURIE_NEURAL_LINK_DOWN]:", error.message, error.stack);
    
    // Respuesta más informativa
    let errorMessage = "**[MODO DEGRADADO]** ⚠️\n\n";
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage += "Error de conexión con servidores AI. Verifica tu conexión.";
    } else if (error.message.includes('API error')) {
      errorMessage += "Error del proveedor AI. Intenta en unos segundos.";
    } else if (error.message.includes('No AI provider')) {
      errorMessage += "Sin proveedor AI configurado. Contacta soporte.";
    } else {
      errorMessage += "Error interno del sistema. Intenta de nuevo.";
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