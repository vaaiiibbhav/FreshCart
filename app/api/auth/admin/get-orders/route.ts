import connectDB from "@/app/lib/db";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
  try{
    await connectDB()
    const orders = await OrderModel.find({}).populate("user assignedDeliveryBoy").sort({createdAt : -1})
    return NextResponse.json({orders},{status:200})
  }catch(error){
    console.log(error)
    return NextResponse.json({error:"Get Orders Failed"},{status:500})
  }
}