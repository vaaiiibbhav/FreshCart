"use client"

import { getSocket } from "@/app/lib/socket"
import { IUser } from "@/models/user.model"
import {
  ChevronDown,
  MapPin,
  CreditCard,
  UserCheck,
  Truck,
  CheckCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface IOrder {
  _id?: any
  user: any
  assignment?: any
  items: {
    grocery: any
    name: string
    price: string
    unit: string
    image: string
    quantity: number
  }[]
  assignedDeliveryBoy?: IUser
  totalAmount: number
  paymentMethod: "cod" | "online"
  isPaid: boolean
  address: {
    fullName: string
    mobile: string
    fullAddress: string
    city: string
    state: string
    pincode: string
    latitude: number
    longitude: number
  }
  status: "pending" | "out of delivery" | "delivered"
  createdAt?: Date
  updatedAt?: Date
}

export default function UserOrderCard({ order }: { order: IOrder }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(order.status)

  useEffect(() => {
    const socket = getSocket()

    const handler = (data: any) => {
      if (data.orderId?.toString() === order._id?.toString()) {
        setStatus(data.status)
      }
    }

    socket.on("order-status-update", handler)
    return () => socket.off("order-status-update", handler)
  }, [order._id])

  const statusMap = {
    pending: "bg-amber-100 text-amber-800",
    "out of delivery": "bg-sky-100 text-sky-800",
    delivered: "bg-emerald-100 text-emerald-800",
  }

  const showPaymentInfo =
    !(status === "delivered" && order.paymentMethod === "cod")

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="rounded-3xl bg-white shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Order ID
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              #{order._id?.toString().slice(-6)}
            </h3>
          </div>

          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ${statusMap[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Payment + Total */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <CreditCard size={16} />
            {showPaymentInfo ? (
              order.paymentMethod === "cod" ? (
                "Cash on Delivery"
              ) : order.isPaid ? (
                "Paid Online"
              ) : (
                "Online Payment (Pending)"
              )
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle size={14} />
                Payment Completed
              </span>
            )}
          </span>

          <span className="text-base font-bold text-gray-900">
            ₹{order.totalAmount}
          </span>
        </div>

        {/* Delivery Partner */}
        {order.assignedDeliveryBoy && (
          <div className="rounded-xl bg-blue-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <UserCheck size={18} />
              Delivery Partner
            </div>

            <div className="text-sm text-gray-800">
              <p className="font-semibold">
                {order.assignedDeliveryBoy.name}
              </p>
              <p className="text-gray-600">
                📞 {order.assignedDeliveryBoy.mobile}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${order.assignedDeliveryBoy.mobile}`}
                className="flex-1 text-center py-2 rounded-lg text-sm font-medium bg-white border hover:bg-gray-50"
              >
                Call
              </a>

              {status !== "delivered" && (
                <button
                  onClick={() =>
                    router.push(`/user/track-order/${order._id?.toString()}`)
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Truck size={16} />
                  Track Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        <div className="rounded-xl bg-gray-50 p-4 space-y-1 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-gray-600">
                📞 {order.address.mobile}
              </p>
              <p className="text-gray-600">
                {order.address.fullAddress}, {order.address.city},{" "}
                {order.address.state} - {order.address.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Items Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          {open ? "Hide items" : `View ${order.items.length} items`}
          <ChevronDown
            size={18}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Items */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-6 py-4 bg-gray-50 border-t space-y-3"
          >
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty {item.quantity} · {item.unit}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  ₹{Number(item.price) * item.quantity}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
