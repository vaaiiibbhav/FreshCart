import connectDB from "@/app/lib/db";
import { auth } from "@/auth";
import OrderModel from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET(){
  try{
    await connectDB()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const orders = await OrderModel.find({}).populate("user assignedDeliveryBoy").sort({createdAt : -1})
    return NextResponse.json({orders},{status:200})
  }catch(error){
    console.log(error)
    return NextResponse.json({error:"Get Orders Failed"},{status:500})
  }
}