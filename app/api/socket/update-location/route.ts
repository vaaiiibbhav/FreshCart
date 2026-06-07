import connectDB from "@/app/lib/db"
import { NextRequest, NextResponse } from "next/server"
import UserModel from "@/models/user.model"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { userId, location } = await request.json()

    if (
      !userId ||
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      typeof location.coordinates[0] !== "number" ||
      typeof location.coordinates[1] !== "number"
    ) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Invalid location format. Expected Geospatial 2dsphere Point format: { type: 'Point', coordinates: [longitude, latitude] }",
      })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, status: 404, message: "User not found" })
    }

    user.location = location
    await user.save()

    return NextResponse.json({ success: true, status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, status: 500 })
  }
}
