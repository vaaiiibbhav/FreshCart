import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import UserModel from "@/models/user.model"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { role, mobile } = await req.json()

    if (!role || !mobile) {
      return NextResponse.json(
        { message: "Role and mobile are required" },
        { status: 400 }
      )
    }

    const user = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        user,
        message: "User updated successfully",
        refreshSession: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Edit role and mobile failed" },
      { status: 500 }
    )
  }
}
