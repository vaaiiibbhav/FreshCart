"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  DollarSign,
  Loader2,
  RefreshCw,
  PlusCircle,
  Upload,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import AdminOrderCard from "./AdminOrderCard"
import { getSocket } from "@/app/lib/socket"
import { motion, AnimatePresence } from "framer-motion"
import type { IUser } from "@/models/user.model"

interface IOrder {
  _id?: string
  user: string
  assignment?: string
  items: [
    {
      grocery: string
      name: string
      price: string
      unit: string
      image: string
      quantity: number
    }
  ]
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

const CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Beverages",
  "Snacks & Cookies",
  "Bakery",
  "Pulses & Legumes",
  "Grains & Cereals",
  "Seafood",
  "Spices & Masalas",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet care",
  "Meat & Poultry",
  "Frozen",
  "Others",
]

const UNITS = [1, 2, 5, 10]

export default function AdminDashboard() {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "out of delivery" | "delivered" | "add-product">("all")
  
  const [activeChartTab, setActiveChartTab] = useState<"daily" | "weekly" | "profit">("daily")
  const [resetting, setResetting] = useState(false)

  const handleResetSandbox = async () => {
    if (!confirm("Are you sure you want to reset all sandbox data? This will clear all orders, chat messages, and reseed products.")) {
      return
    }
    try {
      setResetting(true)
      const res = await axios.post("/api/auth/admin/reset-sandbox")
      if (res.data.success) {
        alert("Sandbox data reset successfully!")
        fetchOrders()
      } else {
        alert(res.data.error || "Failed to reset sandbox")
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.error || err.message || "Failed to reset sandbox")
    } finally {
      setResetting(false)
    }
  }

  /* ---------- ADD PRODUCT STATE ---------- */
  const [formPart, setFormPart] = useState<1 | 2>(1)
  const [prodTitle, setProdTitle] = useState("")
  const [prodCategory, setProdCategory] = useState("Fruits & Vegetables")
  const [prodPrice, setProdPrice] = useState<number | "">("")
  const [prodUnit, setProdUnit] = useState<number>(1)
  const [prodDescription, setProdDescription] = useState("")
  const [prodImageFile, setProdImageFile] = useState<File | null>(null)
  const [prodImagePreview, setProdImagePreview] = useState<string | null>(null)
  const [prodUploading, setProdUploading] = useState(false)
  const [prodUploadProgress, setProdUploadProgress] = useState(0)
  const [prodSuccess, setProdSuccess] = useState(false)
  const [prodError, setProdError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/orders")
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : [])
    } catch (err) {
      console.error("Fetch orders error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const socket = getSocket()

    const handleOrderAssigned = (data: { orderId?: string; assignedDeliveryBoy?: IUser }) => {
      if (data?.orderId && data?.assignedDeliveryBoy) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order._id?.toString() === data.orderId) {
              return {
                ...order,
                status: "out of delivery",
                assignedDeliveryBoy: data.assignedDeliveryBoy,
              }
            }
            return order
          })
        )
      }
    }

    const handleOrderStatusUpdate = (data: { orderId?: string; status?: "pending" | "out of delivery" | "delivered" }) => {
      if (data?.orderId && data?.status) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order._id?.toString() === data.orderId) {
              return {
                ...order,
                status: data.status!,
              }
            }
            return order
          })
        )
      }
    }

    socket.on("order-assigned", handleOrderAssigned)
    socket.on("order-status-update", handleOrderStatusUpdate)

    return () => {
      socket.off("order-assigned", handleOrderAssigned)
      socket.off("order-status-update", handleOrderStatusUpdate)
    }
  }, [])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const outOfDelivery = orders.filter((o) => o.status === "out of delivery").length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const totalSales = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const deliveredOrdersList = orders.filter((o) => o.status === "delivered")
  const averageOrderValue = deliveredOrdersList.length > 0 
    ? totalSales / deliveredOrdersList.length 
    : 0
  const accumulatedGrossProfit = totalSales * 0.35 // 35% margin
  const weeklySalesVolume = deliveredOrdersList.filter(o => {
    const d = o.createdAt ? new Date(o.createdAt) : new Date()
    const diffTime = Math.abs(new Date().getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  const getDailyEarnings = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dayLabel = days[d.getDay()]
      const sum = deliveredOrdersList
        .filter(o => {
          const od = o.createdAt ? new Date(o.createdAt) : new Date()
          return od.getDate() === d.getDate() && 
                 od.getMonth() === d.getMonth() && 
                 od.getFullYear() === d.getFullYear()
        })
        .reduce((s, o) => s + o.totalAmount, 0)
      data.push({ label: `${dayLabel} (${d.getDate()})`, value: sum })
    }
    const maxVal = Math.max(...data.map(d => d.value), 1)
    return data.map(d => ({
      ...d,
      percentage: (d.value / maxVal) * 85 + 5
    }))
  }

  const getWeeklySales = () => {
    const data = []
    const now = new Date()
    for (let i = 3; i >= 0; i--) {
      const start = new Date()
      start.setDate(now.getDate() - (i + 1) * 7)
      const end = new Date()
      end.setDate(now.getDate() - i * 7)
      const sum = deliveredOrdersList
        .filter(o => {
          const od = o.createdAt ? new Date(o.createdAt) : new Date()
          return od >= start && od <= end
        })
        .reduce((s, o) => s + o.totalAmount, 0)
      data.push({ label: `Wk -${i}`, value: sum })
    }
    const maxVal = Math.max(...data.map(d => d.value), 1)
    return data.map(d => ({
      ...d,
      percentage: (d.value / maxVal) * 85 + 5
    }))
  }

  const getGrossProfitProgress = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = []
    const now = new Date()
    let cumulative = 0
    const dailyValues = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dayLabel = days[d.getDay()]
      const sum = deliveredOrdersList
        .filter(o => {
          const od = o.createdAt ? new Date(o.createdAt) : new Date()
          return od.getDate() === d.getDate() && 
                 od.getMonth() === d.getMonth() && 
                 od.getFullYear() === d.getFullYear()
        })
        .reduce((s, o) => s + o.totalAmount, 0)
      dailyValues.push({ label: `${dayLabel} (${d.getDate()})`, profit: sum * 0.35 })
    }
    const finalData = dailyValues.map(dv => {
      cumulative += dv.profit
      return { label: dv.label, value: Math.round(cumulative) }
    })
    const maxVal = Math.max(...finalData.map(d => d.value), 1)
    return finalData.map(d => ({
      ...d,
      percentage: (d.value / maxVal) * 85 + 5
    }))
  }

  const chartData = activeChartTab === "daily" 
    ? getDailyEarnings() 
    : activeChartTab === "weekly" 
    ? getWeeklySales() 
    : getGrossProfitProgress()

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    if (filter === "add-product") return false
    return order.status === filter
  })

  /* ---------- PRODUCT IMAGE SELECT ---------- */
  const handleImageChange = (file: File) => {
    setProdImageFile(file)
    setProdImagePreview(URL.createObjectURL(file))
    setProdError(null)
  }

  /* ---------- ADD PRODUCT SUBMIT ---------- */
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prodTitle || !prodCategory || !prodPrice || !prodUnit) {
      setProdError("All basic fields are required.")
      return
    }

    if (!prodImageFile) {
      setProdError("Product image is required.")
      return
    }

    try {
      setProdUploading(true)
      setProdError(null)
      setProdUploadProgress(10)

      // Step 1: Request signature from API
      const signRes = await axios.post("/api/cloudinary/sign")
      const { signature, timestamp, api_key, cloud_name, folder } = signRes.data
      setProdUploadProgress(30)

      // Step 2: Upload directly to Cloudinary
      const uploadData = new FormData()
      uploadData.append("file", prodImageFile)
      uploadData.append("api_key", api_key)
      uploadData.append("timestamp", String(timestamp))
      uploadData.append("signature", signature)
      uploadData.append("folder", folder)

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        uploadData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
            setProdUploadProgress(30 + Math.round(percent * 0.5)) // Scale to 30% - 80% range
          }
        }
      )

      const imageUrl = uploadRes.data.secure_url
      setProdUploadProgress(85)

      // Step 3: Save to local database
      await axios.post("/api/auth/admin/add-grocery", {
        name: prodTitle,
        category: prodCategory,
        price: Number(prodPrice),
        unit: Number(prodUnit),
        image: imageUrl,
        description: prodDescription
      })

      setProdUploadProgress(100)
      setProdSuccess(true)
      
      // Reset form fields
      setProdTitle("")
      setProdCategory("Fruits & Vegetables")
      setProdPrice("")
      setProdUnit(1)
      setProdDescription("")
      setProdImageFile(null)
      setProdImagePreview(null)
      setFormPart(1)

      setTimeout(() => setProdSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      let message = "Failed to add product. Please check your credentials."
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || message
      } else if (err instanceof Error) {
        message = err.message
      }
      setProdError(message)
    } finally {
      setProdUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            Order Dispatch & Inventory Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitor live order progress, assign delivery partners, and seed grocery products.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetSandbox}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition text-sm font-semibold active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {resetting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Clear & Reset Sandbox Data
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-zinc-50 transition text-sm font-medium text-zinc-700 active:scale-98 shadow-sm cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Orders */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-28"
        >
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Package size={20} />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{totalOrders}</div>
        </motion.div>

        {/* Card 2: Pending Orders */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-28"
        >
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pending</span>
            <Clock size={20} />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingOrders}</div>
        </motion.div>

        {/* Card 3: Out for Delivery */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-28"
        >
          <div className="flex justify-between items-center text-blue-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Out for Delivery</span>
            <Truck size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-600">{outOfDelivery}</div>
        </motion.div>

        {/* Card 4: Delivered */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-28"
        >
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Delivered</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{deliveredOrders}</div>
        </motion.div>

        {/* Card 5: Total Sales */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-28 col-span-2 lg:col-span-1"
        >
          <div className="flex justify-between items-center text-purple-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Delivered Revenue</span>
            <DollarSign size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-600">₹{totalSales}</div>
        </motion.div>
      </div>

      {/* Visual Earnings Graph */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Financial Performance Analytics</h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time revenue metrics from delivered orders.</p>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
            {(["daily", "weekly", "profit"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveChartTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer
                  ${
                    activeChartTab === tab
                      ? "bg-white text-emerald-700 shadow-sm font-semibold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                {tab === "daily" ? "Daily Earnings" : tab === "weekly" ? "Weekly Sales" : "Gross Profit"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Order Value</p>
              <p className="text-xl font-bold text-zinc-800 mt-1">₹{averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Accumulated Gross Profit</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">₹{accumulatedGrossProfit.toFixed(2)}</p>
              <p className="text-[10px] text-zinc-400 mt-1">(35% margins on ₹{totalSales} revenue)</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Weekly Volume</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{weeklySalesVolume} orders</p>
            </div>
          </div>

          <div className="md:col-span-3 min-h-[220px] flex items-end justify-between gap-3 pt-6 px-4 border-l border-b border-zinc-100 h-full">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-[180px] justify-end">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                  ₹{data.value}
                </div>
                <div
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 cursor-pointer shadow-sm group-hover:brightness-95
                    ${
                      activeChartTab === "daily"
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : activeChartTab === "weekly"
                        ? "bg-gradient-to-t from-blue-600 to-sky-400"
                        : "bg-gradient-to-t from-purple-600 to-fuchsia-400"
                    }`}
                  style={{ height: `${data.percentage}%`, minHeight: data.value > 0 ? "4px" : "0px" }}
                />
                <span className="text-[10px] font-semibold text-zinc-500 mt-2 truncate w-full text-center">
                  {data.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Filtering & List View */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Tabs Headers */}
        <div className="flex border-b overflow-x-auto scollbar-hide">
          {(
            [
              { id: "all", label: "All Orders", count: totalOrders },
              { id: "pending", label: "Pending", count: pendingOrders },
              { id: "out of delivery", label: "Out for Delivery", count: outOfDelivery },
              { id: "delivered", label: "Delivered", count: deliveredOrders },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all outline-none cursor-pointer
                ${
                  filter === tab.id
                    ? "border-emerald-600 text-emerald-600 bg-emerald-50/10"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
                }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${filter === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          {/* Add Product Tab */}
          <button
            onClick={() => setFilter("add-product")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all outline-none ml-auto cursor-pointer
              ${
                filter === "add-product"
                  ? "border-green-600 text-green-600 bg-green-50/10"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
              }`}
          >
            <PlusCircle size={16} />
            Add New Product
          </button>
        </div>

        {/* Dynamic Panel Rendering */}
        <div className="p-6">
          {filter !== "add-product" ? (
            /* ================= ORDERS LIST PANEL ================= */
            loading && orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <p className="text-sm text-zinc-500 font-medium">Loading orders list…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3">
                <Package size={48} className="stroke-1" />
                <p className="text-zinc-500 text-sm font-semibold">No orders found</p>
                <p className="text-zinc-400 text-xs">There are no orders that match this filter status right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <AdminOrderCard key={order._id?.toString()} order={order} />
                ))}
              </div>
            )
          ) : (
            /* ================= MULTI-PART ADD PRODUCT FORM ================= */
            <div className="max-w-3xl mx-auto py-4">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-3">
                  <Sparkles size={12} className="text-green-600" />
                  Product Inventory Management
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Add Grocery Product</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Fill in parameters to seed products directly to user catalog.
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex justify-center items-center gap-2 mb-8 max-w-md mx-auto">
                <div
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    formPart >= 1 ? "bg-green-600" : "bg-zinc-200"
                  }`}
                />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
                  Part {formPart} of 2
                </span>
                <div
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    formPart >= 2 ? "bg-green-600" : "bg-zinc-200"
                  }`}
                />
              </div>

              {/* Error Alert */}
              {prodError && (
                <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-800">Error:</span> {prodError}
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {prodSuccess && (
                <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-emerald-900">Success!</span> Product added and seeded into MongoDB inventory database.
                  </div>
                </div>
              )}

              <form onSubmit={handleAddProductSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {formPart === 1 ? (
                    /* PART 1: Basics form */
                    <motion.div
                      key="part-1"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-6"
                    >
                      {/* Name input */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Product Name / Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={prodTitle}
                          onChange={(e) => setProdTitle(e.target.value)}
                          placeholder="e.g. Fresh Crimson Grapes"
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                        />
                      </div>

                      {/* Grid for Price & Unit */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Price (₹ INR) *
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 150"
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                          />
                        </div>

                        {/* Unit Selection */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Package Unit (Qty/Size) *
                          </label>
                          <div className="flex gap-2">
                            {UNITS.map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => setProdUnit(u)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition cursor-pointer border
                                  ${
                                    prodUnit === u
                                      ? "bg-green-600 border-green-600 text-white shadow-sm"
                                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                  }`}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                          Category *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto p-2 border border-zinc-200 rounded-xl bg-zinc-50 scollbar-hide">
                          {CATEGORIES.map((c) => {
                            const isSel = prodCategory === c
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setProdCategory(c)}
                                className={`px-3 py-2 text-xs rounded-lg text-left transition font-medium cursor-pointer border
                                  ${
                                    isSel
                                      ? "bg-green-600 border-green-600 text-white"
                                      : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"
                                  }`}
                              >
                                {c}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Description textarea */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Description / Description Details (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          placeholder="Provide details about the freshness, origin, or organic quality of this product..."
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                        />
                      </div>

                      {/* Action */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          disabled={!prodTitle || !prodPrice}
                          onClick={() => setFormPart(2)}
                          className="inline-flex items-center gap-1.5 bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition hover:bg-green-700 disabled:opacity-40 cursor-pointer shadow-sm"
                        >
                          Continue to Upload
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* PART 2: Media Form */
                    <motion.div
                      key="part-2"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-6"
                    >
                      {/* Image Upload Area */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-3">
                          Upload Product Image *
                        </label>

                        <label
                          className="
                            flex flex-col items-center justify-center
                            border-2 border-dashed border-zinc-200 hover:border-green-500
                            rounded-2xl p-8 cursor-pointer
                            bg-zinc-50 hover:bg-green-50/10 transition-all duration-200
                          "
                        >
                          {prodImagePreview ? (
                            <div className="relative flex flex-col items-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prodImagePreview}
                                alt="Upload Preview"
                                className="h-44 object-contain rounded-xl shadow-sm border bg-white p-2"
                              />
                              <span className="text-xs text-zinc-400 mt-2 font-medium">Click to select a different image</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="w-8 h-8 text-zinc-400 mb-3" />
                              <p className="text-sm font-semibold text-zinc-700">Choose Image file</p>
                              <p className="text-xs text-zinc-400 mt-1">Supports PNG, JPG, JPEG, WEBP up to 5MB</p>
                            </div>
                          )}

                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files && handleImageChange(e.target.files[0])
                            }
                          />
                        </label>
                      </div>

                      {/* Upload Progress Loader */}
                      {prodUploading && (
                        <div className="space-y-2 max-w-md mx-auto text-center">
                          <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold uppercase">
                            <span>Uploading to Cloudinary...</span>
                            <span>{prodUploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${prodUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setFormPart(1)}
                          className="inline-flex items-center gap-1.5 border border-zinc-200 text-zinc-600 font-medium px-4 py-2.5 rounded-xl text-sm transition hover:bg-zinc-50 cursor-pointer shadow-sm bg-white"
                        >
                          <ChevronLeft size={16} />
                          Back Details
                        </button>

                        <button
                          type="submit"
                          disabled={!prodImageFile || prodUploading}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition hover:brightness-105 disabled:opacity-40 cursor-pointer shadow-md"
                        >
                          {prodUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading & Seeding...
                            </>
                          ) : (
                            <>
                              Seed Product Asset
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}