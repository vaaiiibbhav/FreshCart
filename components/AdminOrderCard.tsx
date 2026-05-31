"use client"

import axios from "axios"
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  PackageCheck,
  UserCheck,
} from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { div } from "motion/react-client"
import mongoose from "mongoose"
import { IUser } from "@/models/user.model"

interface IOrder {
  _id ?: mongoose.Types.ObjectId,
  user : mongoose.Types.ObjectId,
  assignment ?: mongoose.Types.ObjectId,
  items: [
    {
      grocery : mongoose.Types.ObjectId,
      name    : string,
      price   : string,
      unit    : string,
      image   : string, 
      quantity: number,
    }
  ],
  assignedDeliveryBoy ?: IUser,
  totalAmount         : number,
  paymentMethod       : "cod" | "online",
  isPaid              : boolean,
  address             : {
    fullName          : string,
    mobile            : string,
    fullAddress       : string,
    city              : string,
    state             : string,
    pincode           : string,
    latitude          : number,
    longitude         : number,
  },
  status            : "pending" | "out of delivery" | "delivered",
  createdAt         ?: Date,
  updatedAt         ?: Date,
}

export default function AdminOrderCard({ order }: { order: IOrder }) {
  const [currentStatus, setCurrentStatus] = useState<string>(order.status)
  const [loading, setLoading] = useState(false)

  const statusColor = {
    pending: "text-amber-600",
    "out of delivery": "text-blue-600",
    delivered: "text-emerald-600",
  }[currentStatus]
  const updateStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true)
      setCurrentStatus(status)
      const res = await axios.post(
        `/api/auth/admin/update-order-status/${orderId}`,
        { status }
      );
      setLoading(false)
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (!order._id) return null

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2.5fr_1fr] gap-6 p-5">

        {/* LEFT — Order Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <PackageCheck size={18} />
            Order #{order._id.toString().slice(-6)}
          </div>

          <p className="text-xs text-zinc-500">
            {new Date(order.createdAt!).toLocaleString()}
          </p>

          <span
            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${order.isPaid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
              }`}
          >
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>

        {/* CENTER — Customer Info */}
        <div className="space-y-3 text-sm text-zinc-700">
          <div className="flex items-center gap-2">
            <User size={16} className="text-zinc-400" />
            {order.address.fullName}
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} className="text-zinc-400" />
            {order.address.mobile}
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-zinc-400 mt-0.5" />
            <span className="line-clamp-2">
              {order.address.fullAddress}
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            <CreditCard size={16} />
            {order.paymentMethod === "cod"
              ? "Cash on Delivery"
              : "Online Payment"}
          </div>
        </div>

        {/*Assigned Delivery Boy */}
        {
          order.assignedDeliveryBoy && (
            <div>
              <UserCheck className="text-blue-600" size={18} />
              <div
               className="font-semibold text-gray-800"
              >
                <p>Assigned to : <span>{order.assignedDeliveryBoy?.name}</span></p>
                <p>📞 {order.assignedDeliveryBoy?.mobile}</p>
              </div>

              <a href={`tel:${order.assignedDeliveryBoy?.mobile}`} className="text-blue-600">Call</a>
            </div>
          )
        }

        {/* RIGHT — Controls */}
        <div className="flex flex-col justify-between items-end gap-4">
          <span className={`text-sm font-semibold ${statusColor}`}>
            {currentStatus}
          </span>

          <select
            disabled={loading}
            value={currentStatus}
            onChange={(e) =>
              updateStatus(order._id!.toString(), e.target.value)
            }
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          >
            <option value="pending">Pending</option>
            <option value="out of delivery">Out for delivery</option>
          </select>

          <div className="text-sm font-semibold text-zinc-900">
            ₹{order.totalAmount}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
