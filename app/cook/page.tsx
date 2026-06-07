"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { getSocket } from "@/app/lib/socket"
import { 
  ChefHat, 
  LogOut, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  Package, 
  Utensils 
} from "lucide-react"

interface IOrder {
  _id: string
  items: [
    {
      name: string
      price: string
      unit: string
      quantity: number
    }
  ]
  totalAmount: number
  paymentMethod: "cod" | "online"
  isPaid: boolean
  status: "pending" | "out of delivery" | "delivered"
  createdAt?: Date
}

export default function CookPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Redirect if not authorized
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/login")
    } else if (sessionStatus === "authenticated" && session?.user?.role !== "cook") {
      router.replace("/unauthorized")
    }
  }, [session, sessionStatus, router])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all orders
      const res = await axios.get("/api/orders")
      // Filter only pending orders for the kitchen queue
      const pending = (res.data.orders || []).filter(
        (o: IOrder) => o.status === "pending"
      )
      setOrders(pending)
    } catch (err) {
      console.error("Failed to load kitchen orders", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Socket updates
  useEffect(() => {
    fetchOrders()

    const socket = getSocket()
    socket.on("new-order", (newOrder: IOrder) => {
      if (newOrder.status === "pending") {
        setOrders(prev => [newOrder, ...prev])
      }
    })

    socket.on("order-status-update", (data: { orderId: string; status: string }) => {
      if (data.status !== "pending") {
        setOrders(prev => prev.filter(o => o._id !== data.orderId))
      }
    })

    return () => {
      socket.off("new-order")
      socket.off("order-status-update")
    }
  }, [fetchOrders])

  const handleMarkPrepared = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      // Update order status to "out of delivery" (prepared and ready for dispatch)
      await axios.put('/api/orders/update-status', { orderId, status: "out of delivery" })
      setOrders(prev => prev.filter(o => o._id !== orderId))
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update order status.")
    } finally {
      setActionLoading(null)
    }
  }

  if (sessionStatus === "loading" || session?.user?.role !== "cook") {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-orange-600" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <ChefHat size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                UrbanGrocer Kitchen
              </h1>
              <p className="text-xs text-zinc-500">Live Culinary Dispatch Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2 border rounded-xl hover:bg-zinc-50 transition cursor-pointer text-zinc-600 shadow-sm"
              title="Refresh queue"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition text-sm font-semibold cursor-pointer border border-red-100"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Utensils size={18} className="text-orange-500" />
            Kitchen Preparation Queue
          </h2>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
            {orders.length} Orders Pending
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {loading && orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <RefreshCw className="animate-spin text-orange-600" size={32} />
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-orange-100 p-12 text-center rounded-3xl shadow-sm"
            >
              <ChefHat size={48} className="text-orange-300 mx-auto mb-4 stroke-1 animate-bounce" />
              <h3 className="text-base font-bold text-zinc-700">Kitchen is All Caught Up!</h3>
              <p className="text-xs text-zinc-400 mt-1">New incoming customer orders will appear here automatically.</p>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {orders.map(order => (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-xs text-zinc-400 font-semibold">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                        Pending Prep
                      </span>
                    </div>

                    {/* Order items */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-zinc-600">
                            {item.name} <span className="text-zinc-400 text-xs">({item.unit} unit)</span>
                          </span>
                          <span className="font-semibold text-zinc-800">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 mt-5">
                    <button
                      onClick={() => handleMarkPrepared(order._id)}
                      disabled={actionLoading === order._id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === order._id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Mark as Prepared
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
