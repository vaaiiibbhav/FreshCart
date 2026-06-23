import connectDB from "@/app/lib/db";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
  try{
    await connectDB()
    const { name, email, password, role, mobile } = await req.json()
    const queryList: Record<string, string>[] = [{ email }]
    if (mobile) {
      queryList.push({ mobile })
    }
    const userExists = await UserModel.findOne({ $or: queryList })
    if (userExists) {
      return NextResponse.json({
        status: 400,
        message: "User already exists!"
      })
    }
    if (password.length < 6) {
      return NextResponse.json({
        status: 400,
        message: "Password must be at least 6 characters long!"
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      mobile: mobile || "",
      isOnline: role === "deliveryBoy" || role === "cook"
    })
    return NextResponse.json({
      status : 201,
      message : "User created successfully!",
      user
    })
  }catch(err){
    console.log(err)
    return NextResponse.json({
      status : 500,
      message : "Internal server error!"
    })
  }
}

// Signup API flow
// name, email, password
// email check
// password minimum 6 characters
// hash password
// create user
// return response