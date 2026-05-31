import connectDB from "@/app/lib/db";
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model";
import OrderModel from "@/models/order.model";
import UserModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import emitEventHandler from "@/app/lib/emitEventHandler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await context.params;

    console.log("ORDER ID RECEIVED:", orderId, typeof orderId);

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid orderId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const status = body?.status;

    if (!status) {
      return NextResponse.json(
        { message: "Missing status" },
        { status: 400 }
      );
    }

    const order = await OrderModel.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 400 }
      );
    }

    if (order.status === status) {
      return NextResponse.json(
        { assignment: order.assignment, availableBoys: [] },
        { status: 200 }
      );
    }

    order.status = status;
    await order.save();

    let deliveryBoysPayload: any = [];

    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;

      let nearByDeliveryBoys = await UserModel.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 10000
          }
        }
      });

      const nearByIds = nearByDeliveryBoys.map((boy) => boy._id);

      const busyIds = await DeliveryAssignmentModel.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["completed", "broadcasted"] }
      }).distinct("assignedTo");

      const busyIdsSet = new Set(busyIds.map((b: any) => b.toString()));

      const availableDeliveryBoysIds = nearByDeliveryBoys.filter(
        b => !busyIdsSet.has(b._id.toString())
      );

      const candidates = availableDeliveryBoysIds.map(
        b => b._id.toString()
      );

      if (candidates.length === 0) {

        await order.save()
        await emitEventHandler("order-status-update",{
          orderId : order._id.toString(),
          status : order.status, 
        })

        return NextResponse.json(
          { assignment: null, availableBoys: [] },
          { status: 200 }
        );
      }

      const deliveryAssignment = await DeliveryAssignmentModel.create({
        order: order._id,
        broadcastedTo: candidates,
        status: "broadcasted"
      });

      await deliveryAssignment.populate("order");

      for(const boyId of candidates){
        const boy = await UserModel.findById(boyId)
        if(boy.socketId){
          await emitEventHandler("new-assignment",{
            deliveryAssignment
          },boy.socketId)
        }
      }
 
      order.assignment = deliveryAssignment._id;
      order.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      await order.save();

      deliveryBoysPayload = availableDeliveryBoysIds.map((boy) => ({
        name: boy.name,
        id: boy._id.toString(),
        mobile: boy.mobile,
        latitude: boy.location.coordinates[1],
        longitude: boy.location.coordinates[0],
        socketId: boy.socketId
      }));

      await deliveryAssignment.populate("order");
    }

    await order.save()
    await emitEventHandler("order-status-update",{
      orderId : order._id.toString(),
      status : order.status,
    })

    return NextResponse.json(
      {
        assignment: order.assignment,
        availableBoys: deliveryBoysPayload
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "update status error" },
      { status: 500 }
    );
  }
}
