import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model"
import { NextResponse } from "next/server"

export async function GET(){
  try {
    await connectDB()
    const session = await auth()
    
    const assignments = await DeliveryAssignmentModel.find({
      broadcastedTo : session?.user?.id,
      status        : "broadcasted" 
    }).populate("order")
    return NextResponse.json(assignments,{status:200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}