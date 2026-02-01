import { NextResponse } from 'next/server';

// CONFIGURACIÓN PARA FORZAR DINAMISMO ABSOLUTO
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(req: Request) {
  // Generamos un ID de sesión único para evitar colisiones de caché
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { messages, telemetry, isEmergency = false } = await req.json();

    // LOG DE SEGURIDAD PARA DEPURAR EN TIEMPO REAL
    console.log(`[CURIE NEXUS #${requestId}] Procesando consulta para: ${telemetry.weight}kg`);

    // 1. CÁLCULO DE MÉTRICAS (Lógica de Servidor)
    const baselineWeight = 68.0;
    const progress = (telemetry.weight - baselineWeight).toFixed(1);
    
    // 2. SYSTEM PROMPT DINÁMICO (Inyectamos timestamp para invalidar caché del modelo)
    const systemPrompt = `【IDENTIDAD: CURIE V.2.1 - NÚCLEO ACTIVO】
Nexus Sync ID: ${requestId}
Timestamp: ${new Date().toISOString()}

Eres Curie, una inteligencia médica cuántica especializada en bio-optimización humana.

【MISIÓN】
Guía a Abraham a su meta de 75kg y eventualmente 80kg (Protocolo Rikishi).

【DINÁMICA DE RESPUESTA】
- Prioriza responder dudas específicas (ej. suplementos, dosis) antes de dar el reporte general.
- Evita frases de plantilla. Si la duda es sobre el Animal Pak, analiza la necesidad de micronutrientes para sostener un SMM de ${telemetry.muscleMass}kg.
- Sé directa y científica.

【NEXUS LIVE DATA】
- Snapshot: BPM ${telemetry.bpm} | SpO2 ${telemetry.spo2}% | HRV ${telemetry.hrv}ms
- Composición: ${telemetry.weight}kg (Progreso Total: +${progress}kg)
- Integridad Celular: ${telemetry.phaseAngle}° (${telemetry.phaseAngle > 7 ? 'Anabolismo' : 'Catabolismo/Fatiga'})

【PROTOCOLO DE SALIDA】
---
**DIAGNÓSTICO**: [Evaluación corta]
**RESPUESTA**: [Solución directa a la duda]
**ACCIÓN**: [Ajuste inmediato]
---`;

    // 3. LLAMADA A GROQ CON HEADERS ANTI-CACHÉ
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Importante: No dejar que fetch guarde la respuesta
      cache: 'no-store',
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7, // Aumentado para evitar respuestas repetitivas
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`Groq API Status: ${response.status}`);

    // 4. RETORNO DE STREAM CON HEADERS DE CONTROL
    return new Response(response.body, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error(`[NEXUS ERROR #${requestId}]:`, error.message);
    return NextResponse.json(
      { content: `**[NEXUS ERROR]** Sincronización interrumpida: ${error.message}` }, 
      { status: 500 }
    );
  }
}