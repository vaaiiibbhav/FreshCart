import connectDB from "@/app/lib/db";
import ChatRoom from "@/models/chatRoom.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req : NextRequest){
  try{
    await connectDB()
    const { orderId,userId,deliveryBoyId } = await req.json()
    let room = await ChatRoom.findOne({
      orderId : orderId
    })
    if(!room){
      room = await ChatRoom.create({
        orderId : orderId,
        userId : userId,
        deliveryBoyId : deliveryBoyId
      })
    }
    return NextResponse.json(room,{status:200})
  }catch(error){
    console.log(error)
    return NextResponse.json({error : "create room error"},{status:500})
  }
}