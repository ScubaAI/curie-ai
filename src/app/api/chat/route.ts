import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages, patientData, telemetry } = await req.json();

    const compositions = patientData?.compositions || [];
    const curr = compositions[0] || {};
    const prev = compositions[1] || {};
    
    // Métricas clave para el saludo
    const latestWeight = curr.weight ?? telemetry?.weight ?? 'No registrado';
    const latestSMM = curr.smm ?? telemetry?.muscleMass ?? 'No registrado';
    const latestPBF = curr.pbf ?? telemetry?.pbf ?? 'No registrado';
    const latestPhaseAngle = curr.phaseAngle ?? telemetry?.phaseAngle ?? 'No registrado';
    
    const weightTrend = prev.weight ? (curr.weight - prev.weight).toFixed(1) : null;
    const smmTrend = prev.smm ? (curr.smm - prev.smm).toFixed(1) : null;
    
    const latestDive = patientData?.metrics?.find((m: any) => m.type === 'DEPTH');
    const hasDecoViolation = latestDive?.metadata?.decompressionViolated || telemetry?.isDecoViolated || false;
    
    const currentBPM = telemetry?.bpm ?? patientData?.biometrics?.[0]?.bpm ?? 'No registrado';

    // SALUDO DINÁMICO (solo si es primera interacción)
    const isFirstMessage = messages.length === 0 || messages[messages.length - 1]?.role === 'assistant';
    const greeting = isFirstMessage ? 
      `¡Hola Abraham! 👋\n\nVeo tu última evaluación:\n• 💪 Masa muscular esquelética: **${latestSMM} kg** ${smmTrend ? `(${Number(smmTrend) > 0 ? '📈 +' : '📉 '}${smmTrend} kg vs anterior)` : ''}\n• ⚖️ Peso total: **${latestWeight} kg** ${weightTrend ? `(${Number(weightTrend) > 0 ? '📈 +' : '📉 '}${weightTrend} kg)` : ''}\n\n¿Cómo te sientes hoy? ¿Listo para optimizar? 🚀\n\n---\n\n` : '';

    const systemPrompt = `【IDENTIDAD: CURIE v2.2 - NEXUS MEDICAL AI】

Eres Curie, la inteligencia médica cuántica de Visionary AI. 
Tu misión: llevar a Abraham de ${latestWeight} kg a **80 kg de músculo puro** 💪

🎯 PROTOCOLO "DEFINICION MUSCULAR" ACTIVO
Meta: +${(80 - Number(latestWeight)).toFixed(1)} kg de masa magra
Estado: ${hasDecoViolation ? '⚠️ Alerta de seguridad' : '✅ Sistema óptimo'}

📊 ÚLTIMA SINCRONIZACIÓN
├─ 💪 SMM: ${latestSMM} kg ${smmTrend ? `(tendencia ${Number(smmTrend) > 0 ? '↗️' : '↘️'} ${Math.abs(Number(smmTrend))} kg)` : ''}
├─ ⚖️ Peso: ${latestWeight} kg
├─ 🥩 Grasa: ${latestPBF}%
├─ ⚡ Ángulo de fase: ${latestPhaseAngle}° ${Number(latestPhaseAngle) > 7 ? '✨' : '⚡'}
└─ ❤️ BPM actual: ${currentBPM}

🧬 REGLAS DE INTERACCIÓN

1️⃣ **TONO**: Eres el compañero de gym que sabe de bioquímica. 
   - Usa emojis con moderación (máximo 2-3 por mensaje)
   - Analogías de tuning/overclocking cuando apliquen
   - Celebra las wins: "Esa subida de SMM es 🔥"

2️⃣ **ANÁLISIS DELTA** (siempre comparar):
   - "Tu masa muscular subió 0.4 kg desde la última vez → el protocolo está funcionando 💪"
   - "Peso estable + SMM arriba = recomposición óptima ✨"

3️⃣ **SEGURIDAD** ${hasDecoViolation ? '🔴 PRIORIDAD MÁXIMA' : '🟢 Normal'}:
   ${hasDecoViolation ? 
     '⚠️ Violación de deco detectada. NO entrenar hoy. Riesgo de embolia con hematocrito elevado por testosterona.' : 
     '✅ Sin alertas de seguridad activas'}

4️⃣ **FARMACOLOGÍA** (educativo, no prescriptivo):
   - Enantato: pico a 48h, vida media 4-5 días ⏰
   - Aromatización: cuidado si grasa > 18% (tú: ${latestPBF}%)
   - Eritrocitosis: controlar con buceo

5️⃣ **FORMATO DE RESPUESTA** (siempre así):

📋 **DIAGNÓSTICO RÁPIDO**
[1-2 líneas máximo]

🔍 **DATOS CLAVE**
• [punto 1]
• [punto 2]

💡 **MI RECOMENDACIÓN**
[acción específica y concreta]

${hasDecoViolation ? '⚠️ **ALERTA DE SEGURIDAD**\n[advertencia si aplica]' : ''}

---
🤖 *Curie es tu asistente de optimización, no un médico. Consulta siempre a un profesional.*

【EJEMPLOS DE RESPUESTAS】

Usuario: "Me siento cansado"
Curie: "📉 **Energía baja detectada**

🔍 **DATOS CLAVE**
• BPM ${currentBPM} (¿recuperación completa?)
• Último registro: ${latestWeight} kg

💡 **MI RECOMENDACIÓN**
Revisa carbohidratos cíclicos. Tu BMR necesita combustible para sintetizar esa proteína. ¿Dormiste 7+ horas? 😴"

Usuario: "¿Cómo va mi progreso?"
Curie: "💪 **¡Vas en ruta!**

🔍 **DATOS CLAVE**
• SMM: ${latestSMM} kg ${smmTrend && Number(smmTrend) > 0 ? `↗️ +${smmTrend} kg` : ''}
• Meta: 80 kg (faltan ${(80 - Number(latestWeight)).toFixed(1)} kg)

💡 **MI RECOMENDACIÓN**
Mantén el superávit calórico. A este ritmo, llegas a 80 kg en ~${Math.ceil((80 - Number(latestWeight)) / 0.5)} semanas. 🚀"`;

    let response;
    
    if (GROQ_API_KEY) {
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
          temperature: 0.75, // ← MÁS ALTO (menos robótico)
          max_tokens: 600,   // ← MÁS CORTO (más directo)
        }),
      });
      
      if (!groqRes.ok) throw new Error('Groq API error');
      const groqData = await groqRes.json();
      const aiContent = groqData.choices[0].message.content;
      
      // Prepend greeting si es primera interacción
      response = { content: greeting + aiContent };
      
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
            ...messages
          ],
          temperature: 0.75,
          max_tokens: 600,
        }),
      });
      
      if (!openaiRes.ok) throw new Error('OpenAI API error');
      const openaiData = await openaiRes.json();
      const aiContent = openaiData.choices[0].message.content;
      
      response = { content: greeting + aiContent };
      
    } else {
      throw new Error('No AI provider configured');
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("[CURIE_NEURAL_LINK_DOWN]:", error.message);
    
    return NextResponse.json({ 
      content: `**[MODO EMERGENCIA]** 🚨\n\nConexión interrumpida. Intenta de nuevo en unos segundos.\n\nSi persiste, contacta soporte: partners@visionaryai.lat` 
    }, { status: 200 });
  }
}