import connectDB from "@/app/lib/db";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){
  try {
    await connectDB()
    const { userId,socketId } = await request.json() 
    const user = await UserModel.findByIdAndUpdate(userId, {
      socketId,
      isOnline : true
    }, { new : true })
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
    return NextResponse.json({
      success : false,
      status : 500,
      message : "Internal server error"
    })
  }
}