import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import "@/models/order.model" // register Order model
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()

    console.log("CONNECTED DB:", mongoose.connection.name)
    console.log("COLLECTION:", DeliveryAssignmentModel.collection.name)

    const session = await auth()
    const deliveryBoyId = session?.user?.id

    console.log("SESSION deliveryBoyId:", deliveryBoyId)

    // 🔍 DEBUG: list all assignedTo values in this collection
    const allAssignments = await DeliveryAssignmentModel.find({}, { assignedTo: 1 })
    console.log(
      "ALL assignedTo values:",
      allAssignments.map(a => a.assignedTo?.toString())
    )

    const activeAssignment = await DeliveryAssignmentModel.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    })
      .populate("order")
      .lean()

    if (!activeAssignment) {
      console.log("❌ NO MATCH FOUND FOR assignedTo + status")
      return NextResponse.json(
        { active: false, assignment: null },
        { status: 200 }
      )
    }

    console.log("✅ ACTIVE ASSIGNMENT FOUND:", activeAssignment._id)

    return NextResponse.json(
      { active: true, assignment: activeAssignment },
      { status: 200 }
    )
  } catch (err) {
    console.error("current-order error:", err)
    return NextResponse.json(
      { error: "current order error" },
      { status: 500 }
    )
  }
}
