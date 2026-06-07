import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = "groceries"

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUD_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUD_API_KEY,
      cloud_name: process.env.CLOUD_NAME,
      folder,
    })
  } catch (error) {
    console.error("Cloudinary signing error:", error)
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    )
  }
}
