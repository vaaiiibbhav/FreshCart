import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q) {
    return NextResponse.json({ error: "Query missing" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "UrbanGrocer/1.0 (contact: support@urbangrocer.com)",
          "Accept": "application/json",
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Nominatim error" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
