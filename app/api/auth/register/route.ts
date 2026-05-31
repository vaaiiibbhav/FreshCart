import connectDB from "@/app/lib/db";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest, res : NextResponse){
  try{
    await connectDB()
    const {name, email, password} = await req.json()
    const userExists = await UserModel.findOne({email})
    if(userExists){
      return NextResponse.json({
        status : 400,
        message : "User already exists!" 
      })
    }
    if(password.length < 6){
      return NextResponse.json({
        status : 400,
        message : "Password must be at least 6 characters long!"
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await UserModel.create({
      name,
      email,
      password : hashedPassword
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