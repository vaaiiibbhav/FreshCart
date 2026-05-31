import connectDB from "@/app/lib/db"
import { NextRequest, NextResponse } from "next/server"
import UserModel from "@/models/user.model"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { userId, location } = await request.json()

    if (!userId || !location) {
      return NextResponse.json({ success: false, status: 400 })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, status: 404 })
    }

    user.location = location
    await user.save()

    return NextResponse.json({ success: true, status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, status: 500 })
  }
}
