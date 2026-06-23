import connectDB from "@/app/lib/db"
import emitEventHandler from "@/app/lib/emitEventHandler"
import { auth } from "@/auth"
import OrderModel from "@/models/order.model"
import UserModel from "@/models/user.model"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activeUserId = session.user.id

    const {
      items,
      paymentMethod,
      totalAmount,
      address,
    } = await req.json()

    if (
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

    const user = await UserModel.findById(activeUserId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const newOrder = await OrderModel.create({
      user: activeUserId,
      userId: activeUserId,
      items,
      paymentMethod,
      totalAmount,
      address: {
        fullName: address.fullName,
        mobile: address.mobile,
        phone: address.mobile || address.phone || "",
        fullAddress: address.address || address.fullAddress || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: latitude,
        longitude: longitude,
      },
      status: "pending",
      isPaid: false,
      deliveryOtp: null,
      deliveryOtpVerification: false,
      deliveredAt: null,
    })

    emitEventHandler("new-order", newOrder).catch((err) =>
      console.error("Emit event failed:", err)
    )

    return NextResponse.json(
      { message: "Order placed successfully", newOrder },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("ORDER_CREATION_CRASH_LOG:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
