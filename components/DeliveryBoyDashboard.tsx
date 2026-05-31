"use client"

import {
  Bike,
  MapPin,
  Power,
  Loader2,
  Package,
  CheckCircle,
} from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { motion } from "framer-motion"

interface Props {
  assignments: any[]
  loading: boolean
}

export default function DeliveryBoyDashboard({
  assignments,
  loading,
}: Props) {
  const { userData } = useSelector((s: RootState) => s.user)

  const [online, setOnline] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [location, setLocation] = useState<[number, number] | null>(null)

  const handleAccept = async (assignmentId: string) => {
    try {
      await axios.post(
        `/api/delivery/assignment/${assignmentId}/accept-assignment`
      )
    } catch {}
  }

  const sendLocationToDB = async (lat: number, lng: number) => {
    if (!userData?._id) return
    try {
      await axios.post("/api/socket/update-location", {
        userId: userData._id,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      })
    } catch {}
  }

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation([lat, lng])
        await sendLocationToDB(lat, lng)
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    )
  }

  return (
    <div className="space-y-8">
      {/* STATUS CARD */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-3xl border shadow-xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <Bike className="text-emerald-600" />
          <h1 className="text-lg sm:text-xl font-semibold text-emerald-700">
            Delivery Partner
          </h1>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p
              className={`font-semibold ${
                online ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {online ? "Online" : "Offline"}
            </p>
          </div>

          <button
            onClick={() => setOnline((p) => !p)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-white transition active:scale-95
              ${online ? "bg-red-500" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            <Power size={16} />
            {online ? "Go Offline" : "Go Online"}
          </button>
        </div>

        <div className="rounded-2xl border p-4 bg-emerald-50">
          <div className="flex items-center gap-2 font-medium text-emerald-700 mb-2">
            <MapPin size={18} />
            Current Location
          </div>

          {location ? (
            <p className="text-sm text-gray-700">
              {location[0].toFixed(5)}, {location[1].toFixed(5)}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Location not updated yet
            </p>
          )}

          <button
            onClick={fetchCurrentLocation}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95"
          >
            {gpsLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            Update Location
          </button>
        </div>
      </motion.div>

      {/* ASSIGNMENTS */}
      <div className="bg-white rounded-3xl border shadow-xl p-6">
        <h2 className="text-lg font-semibold text-emerald-700 mb-4">
          Assigned Orders
        </h2>

        {loading && (
          <p className="text-sm text-gray-500">Loading assignments…</p>
        )}

        {!loading && assignments.length === 0 && (
          <p className="text-sm text-gray-500">
            No orders assigned yet
          </p>
        )}

        <div className="space-y-4 mt-4">
          {assignments.map((a) => (
            <motion.div
              key={a._id}
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white rounded-2xl border shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">
                  Order #{a.order._id.slice(-6)}
                </p>
                <Package className="text-emerald-600" />
              </div>

              <p className="text-sm text-gray-600 mb-1">
                {a.order.address.fullAddress}
              </p>

              <p className="text-sm text-gray-600 mb-3">
                {a.order.items.length} items
              </p>

              <button
                onClick={() => handleAccept(a._id)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition active:scale-95"
              >
                <CheckCircle size={16} />
                Accept Order
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
