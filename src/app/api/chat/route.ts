import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, telemetry } = await req.json();

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
            content: `Eres Curie. Datos de Abraham: ${telemetry.weight}kg, BPM ${telemetry.bpm}. Sé directa.` 
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({ 
      content: data.choices[0].message.content 
    });

  } catch (error) {
    return NextResponse.json(
      { content: "Error en el servidor" }, 
      { status: 500 }
    );
  }
}