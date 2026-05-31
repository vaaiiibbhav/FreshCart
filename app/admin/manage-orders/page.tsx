"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminOrderCard from "@/components/AdminOrderCard"
import { ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getSocket } from "@/app/lib/socket"
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

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    const socket = getSocket()
    socket.on("new-order",(newOrder)=>{
      setOrders(prev => [newOrder,...prev])
    })
    return ()=>{
      socket.off("new-order")
    }
  },[])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await axios.get("/api/auth/admin/get-orders")
        setOrders(res.data.orders || [])
      } catch (err) {
        console.error("Failed to load orders", err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">

      {/* ===== Sticky Header ===== */}
      <header className="sticky top-0 z-30 bg-[#F5F5F7]/85 backdrop-blur border-b border-[#E5E5EA]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium
                       hover:bg-[#EAEAED]
                       active:scale-95 transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Orders
            </h1>
            <p className="text-xs text-[#6E6E73]">
              Track & manage customer orders
            </p>
          </div>
        </div>
      </header>

      {/* ===== Content ===== */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">

          {/* Loading */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <SkeletonList />
            </motion.div>
          )}

          {/* Empty */}
          {!loading && orders.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState />
            </motion.div>
          )}

          {/* Orders */}
          {!loading && orders.length > 0 && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {orders.map(order => (
                <motion.div
                  key={order._id?.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AdminOrderCard order={order} />
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

/* ===============================
   Skeleton Loader
================================ */
function SkeletonList() {
  return (
    <>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="h-24 sm:h-28 rounded-xl bg-white
                     border border-[#E5E5EA]
                     shadow-sm animate-pulse"
        />
      ))}
    </>
  )
}

/* ===============================
   Empty State
================================ */
function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5EA]
                    p-8 sm:p-10 text-center shadow-sm">
      <p className="text-sm text-[#6E6E73]">
        No orders available yet.
      </p>
    </div>
  )
}
