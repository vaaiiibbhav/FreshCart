"use client"

import { getSocket } from "@/app/lib/socket"
import { useEffect, useRef } from "react"
import axios from "axios"

interface GeoUpdaterProps {
  userId: string
  online?: boolean
}

export default function GeoUpdater({ userId, online = false }: GeoUpdaterProps) {
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!userId) return

    // If delivery partner is offline, make sure we clean up the watch and set status to offline in DB
    if (!online) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
        console.log("[GeoUpdater] Cleared watcher (offline)")
      }

      // Explicitly notify backend to set user offline and clear socketId
      axios.post("/api/socket/connect", {
        userId,
        socketId: null,
        isOnline: false,
      }).catch((err) => {
        console.error("[GeoUpdater] Error setting offline status:", err.message)
      })

      return
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.")
      return
    }

    // Connect socket and emit identity to establish linking
    const socket = getSocket()
    socket.emit("identity", userId)

    console.log("[GeoUpdater] Starting geolocation watcher...")
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log(`[GeoUpdater] watchPosition update: lat=${latitude}, lng=${longitude}`)
        
        socket.emit("updateLocation", {
          userId,
          latitude,
          longitude,
        })
      },
      (error) => {
        console.error("[GeoUpdater] watchPosition error:", error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    // Cleanup watcher when unmounting or when online/userId changes
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
        console.log("[GeoUpdater] Cleared watcher (cleanup)")
      }
    }
  }, [userId, online])

  return null
}
