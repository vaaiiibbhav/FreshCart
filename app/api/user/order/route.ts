import connectDB from "@/app/lib/db"
import emitEventHandler from "@/app/lib/emitEventHandler"
import OrderModel from "@/models/order.model"
import UserModel from "@/models/user.model"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      userId,
      items,
      paymentMethod,
      totalAmount,
      address,
    } = await req.json()

    if (
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod ||
      typeof totalAmount !== "number" ||
      !address
    ) {
      return NextResponse.json(
        { error: "Invalid order payload" },
        { status: 400 }
      )
    }

    if (!["cod", "online"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }

    const { latitude, longitude } = address
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      (latitude === 0 && longitude === 0)
    ) {
      return NextResponse.json(
        { error: "Invalid delivery location" },
        { status: 400 }
      )
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const newOrder = await OrderModel.create({
      user: userId,
      items,
      paymentMethod,
      totalAmount,
      address,
      status: "pending",
    })

    emitEventHandler("new-order", newOrder).catch((err) =>
      console.error("Emit event failed:", err)
    )

    return NextResponse.json(
      { message: "Order placed successfully", newOrder },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Place order error" },
      { status: 500 }
    )
  }
}
