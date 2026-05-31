import connectDB from "@/app/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { text, role } = await req.json()

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Message text required" },
        { status: 400 }
      )
    }

    const prompt = `
You are a ${role}.
Based on the last message: "${text}"

Give 3 short, polite chat reply suggestions.
Return ONLY a JSON array of strings.
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"
      
    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(rawText)
    } catch {
      suggestions = []
    }

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
