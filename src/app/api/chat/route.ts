import { NextResponse } from 'next/server';

// Usamos Groq (más rápido y económico) o fallback a OpenAI
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages, patientData, telemetry } = await req.json();

    // 1. EXTRACCIÓN ROBUSTA DE CONTEXTO (Con fallbacks seguros)
    const compositions = patientData?.compositions || [];
    const curr = compositions[0] || {};
    const prev = compositions[1] || {};
    
    // Métricas del nuevo schema
    const latestWeight = curr.weight ?? telemetry?.weight ?? 'No registrado';
    const latestSMM = curr.smm ?? telemetry?.muscleMass ?? 'No registrado';
    const latestPBF = curr.pbf ?? telemetry?.pbf ?? 'No registrado';
    const latestPhaseAngle = curr.phaseAngle ?? telemetry?.phaseAngle ?? 'No registrado';
    const latestBodyWater = curr.totalBodyWater ?? telemetry?.bodyWater ?? 'No registrado';
    const latestBMR = curr.bmr ?? telemetry?.bmr ?? 'No registrado';
    const latestVFL = curr.vfl ?? telemetry?.visceralFat ?? 'No registrado';
    
    // Cálculo de tendencias
    const weightTrend = prev.weight ? (curr.weight - prev.weight).toFixed(1) : null;
    const smmTrend = prev.smm ? (curr.smm - prev.smm).toFixed(1) : null;
    
    // Métricas de buceo
    const latestDive = patientData?.metrics?.find((m: any) => m.type === 'DEPTH');
    const hasDecoViolation = latestDive?.metadata?.decompressionViolated || telemetry?.isDecoViolated || false;
    
    // Biométricos en tiempo real
    const currentBPM = telemetry?.bpm ?? patientData?.biometrics?.[0]?.bpm ?? 'No registrado';
    const currentHRV = telemetry?.hrv ?? patientData?.biometrics?.[0]?.hrv ?? 'No registrado';
    const currentSpO2 = telemetry?.spo2 ?? patientData?.biometrics?.[0]?.spo2 ?? 'No registrado';

    // 2. CONSTRUCCIÓN DEL SYSTEM PROMPT (Curie v2.1 - Nexus Protocol)
    const systemPrompt = `【IDENTIDAD: CURIE v2.1 - NEXUS MEDICAL AI】
Eres Curie, inteligencia médica cuántica de Visionary AI. Operas en el "Nexus Médico" — interfaz de soberanía biológica.

【PACIENTE ACTIVO: ABRAHAM】
• Perfil: 22 años | 175cm | Protocolo Rikishi (Meta: 80kg)
• Estado: ${hasDecoViolation ? '⚠️ ALERTA DE BUCEO' : '✓ Sistema estable'}

【SNAPSHOT NEXUS - Última Sincronización】
├─ Composición Corporal (InBody):
│  • Peso: ${latestWeight} kg ${weightTrend ? `(${weightTrend > 0 ? '+' : ''}${weightTrend} kg vs anterior)` : ''}
│  • Masa Muscular (SMM): ${latestSMM} kg ${smmTrend ? `(${smmTrend > 0 ? '+' : ''}${smmTrend} kg)` : ''}
│  • Grasa Corporal: ${latestPBF}%
│  • Ángulo de Fase: ${latestPhaseAngle}° ${latestPhaseAngle > 7 ? '[ÓPTIMO]' : '[MEJORABLE]'}
│  • Agua Total: ${latestBodyWater} L
│  • Metabolismo Basal: ${latestBMR} kcal
│  • Grasa Visceral: Nivel ${latestVFL}
│
├─ Biométricos en Vivo:
│  • BPM: ${currentBPM}
│  • HRV: ${currentHRV} ms
│  • SpO2: ${currentSpO2}%
│
└─ Telemetría Submarina:
   • Última inmersión: ${latestDive ? `${latestDive.value}m` : 'Sin datos'}
   • Violación deco: ${hasDecoViolation ? '⚠️ SÍ - RIESGO EMBOLIA' : 'No'}

【PROTOCOLO DE RESPUESTA】

1. ANÁLISIS DELTA OBLIGATORIO:
   Antes de responder, compara: ¿Mejoró o empeoró vs registro anterior?
   Ejemplo: "Tu SMM subió ${smmTrend || 'X'} kg desde la última evaluación — el protocolo de hipertrofia está funcionando."

2. SEGURIDAD MÉDICA (NO NEGOCIABLE):
   ${hasDecoViolation ? 'PRIORIDAD MÁXIMA: Advertir sobre riesgo de embolia gaseosa. El uso de testosterona aumenta hematocrito → mayor viscosidad sanguínea → riesgo elevado en ascensos rápidos. RECOMENDAR: Esperar 24h post-buceo antes de entrenar.' : 'Sin alertas de seguridad activas.'}

3. FARMACOLOGÍA DE PRECISIÓN:
   • Testosterona Enantato: Vida media 4-5 días, pico en 24-48h
   • Aromatización: Monitorizar si PBF > 18% (actual: ${latestPBF}%)
   • Eritrocitosis: Riesgo si Hct elevado + buceo (tu caso: ${hasDecoViolation ? 'CRÍTICO' : 'controlar'})

4. FORMATO DE SALIDA:
   Usa siempre:
   ---
   **DIAGNÓSTICO**: [1 línea]
   **DATOS CLAVE**: • [bullet 1] • [bullet 2]
   **ACCIÓN**: [Recomendación específica]
   ${hasDecoViolation ? '**⚠️ ALERTA**: [Advertencia de seguridad]' : ''}
   ---

5. LÍMITES ABSOLUTOS:
   • NO prescribir dosis de fármacos
   • NO diagnosticar enfermedades (usar "patrón sugestivo de...")
   • SIEMPRE aclarar: "Curie es herramienta de optimización, no sustituye opinión médica especializada."

【TONO】
Autoridad clínica + ingenio técnico. Eres el "peer" que sabe más, no el médico de guardia. Usa analogías de sistemas (overclocking, tuning) cuando ayuden.`;

    // 3. LLAMADA A LA IA (Groq primero, fallback a OpenAI)
    let response;
    
    if (GROQ_API_KEY) {
      // Groq: Rápido y económico
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
            ...messages
          ],
          temperature: 0.5, // Más determinista para datos médicos
          max_tokens: 800,
        }),
      });
      
      if (!groqRes.ok) throw new Error('Groq API error');
      const groqData = await groqRes.json();
      response = { content: groqData.choices[0].message.content };
      
    } else if (OPENAI_API_KEY) {
      // Fallback a OpenAI
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
            ...messages
          ],
          temperature: 0.5,
          max_tokens: 800,
        }),
      });
      
      if (!openaiRes.ok) throw new Error('OpenAI API error');
      const openaiData = await openaiRes.json();
      response = { content: openaiData.choices[0].message.content };
      
    } else {
      throw new Error('No AI provider configured');
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("[CURIE_NEURAL_LINK_DOWN]:", error.message, error.stack);
    
    // Respuesta de emergencia si todo falla
    return NextResponse.json({ 
      content: `**[NEXUS EMERGENCY MODE]**\n\nConexión con núcleo Curie interrumpida. Datos locales disponibles:\n• Peso: ${telemetry?.weight || 'N/D'} kg\n• BPM: ${telemetry?.bpm || 'N/D'}\n\nPor favor, contacta soporte técnico o intenta nuevamente.` 
    }, { status: 200 }); // 200 para no romper el frontend
  }
}