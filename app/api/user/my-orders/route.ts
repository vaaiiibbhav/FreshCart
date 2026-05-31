import connectDB from "@/app/lib/db";
import { auth } from "@/auth";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const orders = await OrderModel.find({ user: session?.user?.id }).populate("user assignedDeliveryBoy").sort({ createdAt: -1 })
    if (!orders) {
      return NextResponse.json({ error: "No orders found" }, { status: 400 })
    }
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}