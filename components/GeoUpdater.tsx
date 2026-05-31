"use client"
import { getSocket } from "@/app/lib/socket"
import { useEffect } from "react"

export default function GeoUpdater({userId}: {userId : string}){
  let socket = getSocket()
  socket.emit("identity",userId)
  useEffect(() => {
    if(!userId) return
    if(!navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition((position) => {
      socket.emit("updateLocation", {
        userId,
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
      })
    },(error)=>{
      console.log(error)
    },{ enableHighAccuracy : true})
    return () => navigator.geolocation.clearWatch(watcher)
  }, [userId])
  return null
} 

