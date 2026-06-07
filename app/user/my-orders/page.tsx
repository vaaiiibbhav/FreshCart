"use client"

import axios from "axios"
import { Loader2, PackageSearch, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { getSocket } from "@/app/lib/socket"
import UserOrderCard, { type IOrder } from "@/components/UserOrderCard"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [onlineCount, setOnlineCount] = useState(0)

  const fetchOrders = useCallback(async () => {
    setError("")
    setLoading(true)
    try {
      const res = await axios.get("/api/user/my-orders")
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : [])
    } catch {
      setOrders([])
      setError("Could not load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const socket = getSocket()

    const updateOrderStatus = (data: { orderId?: string; status: IOrder["status"] }) => {
      setOrders(prev => {
        if (!Array.isArray(prev)) return prev
        return prev.map(order =>
          String(order._id) === String(data.orderId)
            ? { ...order, status: data.status }
            : order
        )
      })
    }

    socket.on("order-status-update", updateOrderStatus)
    socket.on("connect", () => setOnlineCount(1))
    socket.on("disconnect", () => setOnlineCount(0))

    return () => {
      socket.off("order-status-update", updateOrderStatus)
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [])

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              {onlineCount > 0 ? (
                <><Wifi size={14} className="text-green-600" /> Live order updates</>
              ) : (
                <><WifiOff size={14} className="text-gray-400" /> Connecting updates...</>
              )}
            </p>
            <h1 className="text-2xl font-bold text-emerald-800 sm:text-3xl">
              My Orders
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border bg-white py-20 text-emerald-700 shadow-sm">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            <PackageSearch className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
            <p className="text-lg font-medium text-gray-700">No orders found</p>
            <p className="mt-1">Start shopping to place your first order!</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <UserOrderCard key={String(order._id)} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
