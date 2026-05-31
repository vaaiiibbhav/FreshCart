import connectDB from "@/app/lib/db"
import OrderModel from "@/models/order.model"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB()

    // ✅ UNWRAP params
    const { orderId } = await context.params

    const order = await OrderModel
      .findById(orderId)
      .populate("assignedDeliveryBoy")

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
