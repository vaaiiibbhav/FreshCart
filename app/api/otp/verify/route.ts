import connectDB from "@/app/lib/db";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  try{
    await connectDB()
    const { orderId,otp } = await req.json()
    if(!orderId || !otp){
      return NextResponse.json(
        { message : "Order ID and OTP are required"},
        { status : 400}
      )
    }
    const order = await OrderModel.findById(orderId)
    if(!order){
      return NextResponse.json(
        { message : "Order not found"},
        { status : 404}
      )
    }
    if(order.deliveryOtp !== otp){
      return NextResponse.json(
        { message : "Invalid OTP"},
        { status : 400}
      )
    }
    order.status = "delivered"
    order.deliveryOtpVerification = true
    order.deliveredAt = new Date()
    await order.save()

    await DeliveryAssignmentModel.updateOne(
      { order : orderId },
      { $set : { assignedTo : null, status : "completed" }}
    )

    return NextResponse.json(
      { message : "OTP verified successfully"},
      { status : 200}
    )
  }catch(err){
    return NextResponse.json(
      { message : "Internal server error"},
      { status : 500}
    )
  }
}