import axios from "axios"

export default async function emitEventHandler(event:string,data:any,socketId?:string){
  try{
   await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`,{
    socketId,
    event,
    data
   })
  }catch(err){
    console.log(err)

  }
}