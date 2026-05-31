import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          // REQUIRED by Nominatim usage policy
          "User-Agent": "UrbanGrocer/1.0 (contact@urbangrocer.com)",
          "Accept": "application/json",
        },
        // avoid caching stale addresses
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch address" },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Reverse geocode error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
