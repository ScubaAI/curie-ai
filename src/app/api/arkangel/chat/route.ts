import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, conversation_id, context, file_ids, language } = await req.json();

  try {
    const response = await fetch("https://api.arkangelai.com/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ARKANGEL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        conversation_id,
        context,
        file_ids,
        language: language || "es"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Arkangel API error");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to communicate with Arkangel" },
      { status: 500 }
    );
  }
}
