"use client"

import {
  Bike,
  MapPin,
  Power,
  Loader2,
  Package,
  CheckCircle,
  User,
  Phone,
} from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { motion } from "framer-motion"
import GeoUpdater from "@/components/GeoUpdater"

export interface Assignment {
  _id: string
  order: {
    _id: string
    address: {
      fullName: string
      mobile: string
      fullAddress: string
      city: string
      state: string
      pincode: string
    }
    items: Array<{
      grocery: string
      name: string
      price: string
      unit: string
      image: string
      quantity: number
    }>
    totalAmount: number
  }
}

interface Props {
  assignments: Assignment[]
  loading: boolean
  onAcceptSuccess?: () => void
}

export default function DeliveryBoyDashboard({
  assignments,
  loading,
  onAcceptSuccess,
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
      if (onAcceptSuccess) {
        onAcceptSuccess()
      }
    } catch (err) {
      console.error("Accept assignment error:", err)
    }
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
      {userData?._id && <GeoUpdater userId={userData._id} online={online} />}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {assignments.map((a) => (
            <motion.div
              key={a._id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-semibold text-zinc-800">
                    Order #{a.order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    ID: {a.order._id}
                  </p>
                </div>
                <Package className="text-emerald-600" size={24} />
              </div>

              {/* Customer and Address Details */}
              <div className="space-y-2 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-zinc-400" />
                  <span className="font-medium text-zinc-800">{a.order.address.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-zinc-400" />
                  <span>{a.order.address.mobile}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-relaxed">
                    {a.order.address.fullAddress}, {a.order.address.city}, {a.order.address.state} - {a.order.address.pincode}
                  </span>
                </div>
              </div>

              {/* Item Summaries */}
              <div className="bg-zinc-50 rounded-xl p-3 space-y-1.5 border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Items ({a.order.items.length})
                </p>
                {a.order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs text-zinc-700">
                    <span>
                      {item.name} <span className="text-zinc-400">({item.unit})</span>
                    </span>
                    <span className="font-medium">
                      {item.quantity} x ₹{item.price}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center border-t pt-2 mt-2 font-semibold text-zinc-900 text-sm">
                  <span>Total Amount</span>
                  <span>₹{a.order.totalAmount}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAccept(a._id)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition active:scale-98"
              >
                <CheckCircle size={18} />
                Accept Order
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
