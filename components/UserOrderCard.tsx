"use client"

import { getSocket } from "@/app/lib/socket"
import type { IUser } from "@/models/user.model"
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

type IdLike = string | { toString(): string }

type OrderStatus = "pending" | "out of delivery" | "delivered"

export interface IOrder {
  _id?: IdLike
  user: unknown
  assignment?: unknown
  items: {
    grocery: unknown
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
  status: OrderStatus
  createdAt?: Date
  updatedAt?: Date
}

export default function UserOrderCard({ order }: { order: IOrder }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(order.status)

  useEffect(() => {
    const socket = getSocket()

    const handler = (data: { orderId?: IdLike; status: OrderStatus }) => {
      if (data.orderId?.toString() === order._id?.toString()) {
        setStatus(data.status)
      }
    }

    socket.on("order-status-update", handler)
    return () => {
      socket.off("order-status-update", handler)
    }
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
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Header */}
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Order ID
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              #{order._id?.toString().slice(-6)}
            </h3>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-1 text-xs font-semibold capitalize ${statusMap[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Payment + Total */}
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
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

          <span className="text-base font-bold text-gray-900 sm:text-right">
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

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                href={`tel:${order.assignedDeliveryBoy.mobile}`}
                className="flex-1 rounded-lg border bg-white py-2 text-center text-sm font-medium transition hover:bg-gray-50"
              >
                Call
              </a>

              {status !== "delivered" && (
                <button
                  onClick={() =>
                    router.push(`/user/track-order/${order._id?.toString()}`)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
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
            <div className="min-w-0">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-gray-600">
                📞 {order.address.mobile}
              </p>
              <p className="break-words text-gray-600">
                {order.address.fullAddress}, {order.address.city},{" "}
                {order.address.state} - {order.address.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Items Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 hover:px-3 hover:text-emerald-800"
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
            className="space-y-3 border-t bg-gray-50 px-4 py-4 sm:px-6"
          >
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty {item.quantity} · {item.unit}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-gray-900">
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
