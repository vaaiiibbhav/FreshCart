import connectDB from "@/app/lib/db";
import Message from "@/models/message.model";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req : NextRequest){
  try{
    await connectDB()
    const { senderId,text,roomId,time } = await req.json()
    const room = await OrderModel.findById(roomId)
    if(!room){
      return NextResponse.json({
        message : "room not found",
        status : 400 
      })
    }
    const message = await Message.create({
      senderId : senderId,
      text : text,
      roomId : roomId,
      time : time
    })
    return NextResponse.json(message,{status:200})

  }catch(error){
    console.log(error)
    return NextResponse.json({error : "create room error"},{status:500})
  }
}