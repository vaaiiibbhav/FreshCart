import connectDB from "@/app/lib/db";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){
  try {
    await connectDB()
    const { userId, socketId, isOnline } = await request.json() 
    const updateData: { socketId: string | null; isOnline?: boolean } = { socketId }
    if (typeof isOnline === "boolean") {
      updateData.isOnline = isOnline
    } else {
      updateData.isOnline = true
    }
    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new : true })
    if(!user){
      return NextResponse.json({
        success : false,
        status : 404,
        message : "User not found"
      })
    }
    return NextResponse.json({
      success : true,
      status : 200,
      message : "User connected successfully"
    })
  } catch (error) {
    console.error("Socket connect route error:", error)
    return NextResponse.json({
      success : false,
      status : 500,
      message : "Internal server error"
    })
  }
}