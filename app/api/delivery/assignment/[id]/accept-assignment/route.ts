import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model"
import OrderModel from "@/models/order.model"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import emitEventHandler from "@/app/lib/emitEventHandler"

export const dynamic = "force-dynamic"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid assignment id" },
        { status: 400 }
      )
    }

    const session = await auth()
    const deliveryBoyId = session?.user?.id

    if (!deliveryBoyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const assignment = await DeliveryAssignmentModel.findById(id)
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.status !== "broadcasted") {
      return NextResponse.json(
        { error: "Assignment not broadcasted" },
        { status: 400 }
      )
    }

    const alreadyAssigned = await DeliveryAssignmentModel.findOne({
      assignedTo: deliveryBoyId,
      status: { $nin: ["completed", "broadcasted"] },
    })

    if (alreadyAssigned) {
      return NextResponse.json(
        { error: "Already assigned to another order" },
        { status: 400 }
      )
    }

    assignment.assignedTo = deliveryBoyId
    assignment.status = "assigned"
    assignment.acceptedAt = new Date()
    await assignment.save()

    const order = await OrderModel.findById(assignment.order)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    order.assignment = assignment._id
    order.assignedDeliveryBoy = deliveryBoyId
    order.status = "out of delivery"

    await order.save()

    await order.populate("assignedDeliveryBoy")

    await emitEventHandler("order-assigned",{
      assignedDeliveryBoy : order.assignedDeliveryBoy,
      orderId : order._id
    })

    await DeliveryAssignmentModel.updateMany(
      {
        _id: { $ne: assignment._id },
        broadcastedTo: deliveryBoyId,
        status: "broadcasted",
      },
      {
        $pull: { broadcastedTo: deliveryBoyId },
      }
    )

    return NextResponse.json(
      { message: "Order accepted successfully" },
      { status: 200 }
    )
  } catch (err) {
    console.error("ACCEPT ASSIGNMENT ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
