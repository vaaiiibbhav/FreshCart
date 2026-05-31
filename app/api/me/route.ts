import { auth } from "@/auth";
import UserModel from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
  try{
    const session = await auth()
    if(!session || !session.user){
      return new Response(JSON.stringify({error:"Unauthorized"}),{
        status:401,
        headers:{"Content-Type":"application/json"}
      })
    }
    const user = await UserModel.findOne({email:session.user.email}).select("-password")
    if(!user){
      return new Response(JSON.stringify({error:"User not found"}),{
        status:404,
        headers:{"Content-Type":"application/json"}
      })
    }
    return new Response(JSON.stringify(user),{
      status:200,
      headers:{"Content-Type":"application/json"}
    })
  }catch(error){
    console.log(error)
    return new Response(JSON.stringify({error:"Internal Server Error"}),{
      status:500,
      headers:{"Content-Type":"application/json"}
    })
  }
}