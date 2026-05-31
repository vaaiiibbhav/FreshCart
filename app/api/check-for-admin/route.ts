import connectDB from "@/app/lib/db"
import UserModel from "@/models/user.model"
import { NextResponse } from "next/server"

export async function GET(){
  try {
    await connectDB()
    const user = await UserModel.find({"role":"admin"})
    if(user.length > 0){
      return NextResponse.json({ message: "AdminExists" }, { status: 200 })
    }
    return NextResponse.json({ message: "AdminNotExists" }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}