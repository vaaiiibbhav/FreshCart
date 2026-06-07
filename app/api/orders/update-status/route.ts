import connectDB from "@/app/lib/db";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import emitEventHandler from "@/app/lib/emitEventHandler";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid orderId" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { message: "Missing status" },
        { status: 400 }
      );
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === status) {
      return NextResponse.json(
        { message: "Order status already set" },
        { status: 200 }
      );
    }

    order.status = status;
    await order.save();

    await emitEventHandler("order-status-update", {
      orderId: order._id.toString(),
      status: order.status,
    });

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        orderId: order._id.toString(),
        status: order.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
