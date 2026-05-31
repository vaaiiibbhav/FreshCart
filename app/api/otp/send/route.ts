import connectDB from "@/app/lib/db";
import { sendMail } from "@/app/lib/mailer";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  try{
    await connectDB()
    const { orderId } = await req.json()
    const order       = await OrderModel.findById(orderId).populate("user")
    if(!order){
      return NextResponse.json({
        message : "Order not found",
        status  : 400
      })
    }
    const otp = Math.floor(1000 + Math.random()*9000).toString()
    order.deliveryOtp = otp
    await order.save()
    
    await sendMail({
      to:order.user.email,
      subject:"Your delivery OTP",
      html:`<h2>Your OTP is <strong>${otp}</strong></h2>`
    })

    return NextResponse.json({
      message : "OTP sent successfully",
      status  : 200
    })
    
  }catch(err){
    console.log(err)
    return NextResponse.json({
      message : "Something went wrong",
      status  : 500
    })
    
  }
}