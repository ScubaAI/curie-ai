import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, telemetry } = await req.json();
    console.log(`[DEBUG] Llamando a Groq para Abraham: ${telemetry.weight}kg`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Eres Curie, inteligencia médica. Abraham pesa ${telemetry.weight}kg. Objetivo: 80kg. Responde de forma breve y científica.` 
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    // ERROR COMÚN: Groq a veces devuelve un error en el JSON
    if (data.error) {
      console.error("[GROQ ERROR]", data.error);
      return NextResponse.json({ content: "Error de Groq: " + data.error.message }, { status: 500 });
    }

    // EXTRAEMOS EL TEXTO CORRECTAMENTE
    const aiMessage = data.choices[0]?.message?.content || "No pude generar una respuesta.";

    return NextResponse.json({ content: aiMessage });

  } catch (error: any) {
    console.error("[SERVER ERROR]", error);
    return NextResponse.json({ content: "Error interno: " + error.message }, { status: 500 });
  }
}