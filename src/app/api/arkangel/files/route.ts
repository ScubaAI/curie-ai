import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Forward to Arkangel
    const response = await fetch("https://api.arkangelai.com/v1/files", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ARKANGEL_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");
  
  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 });
  }

  try {
    await fetch(`https://api.arkangelai.com/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${process.env.ARKANGEL_API_KEY}`
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
