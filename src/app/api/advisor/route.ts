import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, phaseAngle, history, systemPrompt } = await req.json();

  try {
    const response = await fetch("https://api.dr7.ai/v1/infer", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DR7_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dr7-medical-v2",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m: any) => ({ role: m.role, content: m.content })),
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    return NextResponse.json({
      response: data.choices[0].message.content,
      confidence: data.confidence || 75,
      usage: data.usage
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Dr7.ai inference failed" },
      { status: 500 }
    );
  }
}
