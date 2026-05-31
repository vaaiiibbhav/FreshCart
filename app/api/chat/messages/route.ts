import connectDB from "@/app/lib/db";
import Message from "@/models/message.model";
import OrderModel from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req : NextRequest){
  try{
    await connectDB()
    const { roomId } = await req.json()
    let room = await OrderModel.findById(roomId)
    if(!room){
      return NextResponse.json({
              message : "room not found",
              status : 400 
            })
    }
    const messages = await Message.find({roomId : room._id})
    return NextResponse.json(messages,{status:200})
  }catch(error){
    console.log(error)
    return NextResponse.json({error : "get messages error"},{status:500})
  }
}