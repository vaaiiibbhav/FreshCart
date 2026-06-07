"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import DeliveryBoyDashboard, { Assignment } from "./DeliveryBoyDashboard"
import DeliveryChat from "./DeliveryChat"
import { getSocket } from "@/app/lib/socket"
import {
  MapPin,
  User,
  Phone,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { motion } from "motion/react"

interface ActiveAssignment extends Assignment {
  assignedTo: string
}

export default function DeliveryBoy() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Active assignment state
  const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null)
  const [checkingActive, setCheckingActive] = useState(true)
  
  // OTP Modal state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [otpStatus, setOtpStatus] = useState<"idle" | "verifying" | "success" | "failure">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const checkActiveOrder = async () => {
    try {
      setCheckingActive(true)
      const res = await axios.get("/api/delivery/current-order")
      if (res.data?.active && res.data?.assignment) {
        setActiveAssignment(res.data.assignment)
      } else {
        setActiveAssignment(null)
      }
    } catch (err) {
      console.error("Failed to check active order:", err)
      setActiveAssignment(null)
    } finally {
      setCheckingActive(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/delivery/get-assignments")
      setAssignments(Array.isArray(res.data) ? res.data : [])
    } catch {
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkActiveOrder()
    fetchAssignments()
  }, [])

  // Listen to new-assignment socket broadcast reactively
  useEffect(() => {
    const socket = getSocket()

    const handleNewAssignment = (data: { deliveryAssignment?: Assignment }) => {
      const newAssignment = data?.deliveryAssignment
      if (newAssignment) {
        setAssignments((prev) => {
          if (prev.some((a) => a._id === newAssignment._id)) {
            return prev
          }
          return [...prev, newAssignment]
        })
      }
    }

    socket.on("new-assignment", handleNewAssignment)

    return () => {
      socket.off("new-assignment", handleNewAssignment)
    }
  }, [])

  const handleAcceptSuccess = async () => {
    await checkActiveOrder()
    await fetchAssignments()
  }

  const handleOtpChange = (val: string, index: number) => {
    if (val && isNaN(Number(val))) return
    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`)
        prevInput?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
      } else {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    }
  }

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6 || !activeAssignment) return

    try {
      setOtpStatus("verifying")
      const orderId = activeAssignment.order._id
      await axios.post("/api/otp/verify", {
        orderId,
        otp: otpCode,
      })

      // Notify other clients via socket of order completion
      const socket = getSocket()
      socket.emit("updateLocation", {
        userId: activeAssignment.assignedTo,
        latitude: 0,
        longitude: 0,
      })

      setOtpStatus("success")
    } catch (err: unknown) {
      setOtpStatus("failure")
      const errMsg = axios.isAxiosError(err) 
        ? err.response?.data?.message 
        : (err instanceof Error ? err.message : "Invalid OTP code. Please try again.")
      setErrorMessage(errMsg || "Invalid OTP code. Please try again.")
    }
  }

  const closeModal = () => {
    setIsOtpModalOpen(false)
    setOtp(Array(6).fill(""))
    setOtpStatus("idle")
    setErrorMessage("")
  }

  const handleSuccessClose = async () => {
    closeModal()
    await checkActiveOrder()
    await fetchAssignments()
  }

  const renderOtpInputView = () => (
    <div className="flex flex-col items-center text-center space-y-5">
      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
        <Lock size={22} />
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-zinc-950">Verify Order Delivery</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-xs">
          Enter the 6-digit OTP code provided by the customer to confirm delivery.
        </p>
      </div>

      <div className="flex gap-2 justify-center my-2">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-input-${idx}`}
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-12 h-12 text-center text-lg font-bold border border-zinc-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
          />
        ))}
      </div>

      <button
        onClick={handleVerifyOtp}
        disabled={otp.join("").length !== 6}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-md"
      >
        Verify & Deliver
      </button>
    </div>
  )

  const renderOtpVerifyingView = () => (
    <div className="flex flex-col items-center text-center py-6 space-y-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <div>
        <h3 className="text-lg font-bold text-zinc-950">Verifying OTP</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Validating code and processing delivery receipt...
        </p>
      </div>
    </div>
  )

  const renderOtpSuccessView = () => (
    <div className="flex flex-col items-center text-center space-y-5 py-4">
      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
        <CheckCircle2 size={32} />
      </div>

      <div>
        <h3 className="text-xl font-bold text-emerald-700">Delivery Completed!</h3>
        <p className="text-sm text-zinc-500 mt-1.5 max-w-xs">
          {"OTP verified successfully. An itemized invoice has been dispatched to the customer's registered email address."}
        </p>
      </div>

      <button
        onClick={handleSuccessClose}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-md"
      >
        Return to Dashboard
      </button>
    </div>
  )

  const renderOtpFailureView = () => (
    <div className="flex flex-col items-center text-center space-y-5 py-4">
      <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
        <AlertTriangle size={32} />
      </div>

      <div>
        <h3 className="text-xl font-bold text-rose-700">Verification Failed</h3>
        <p className="text-sm text-zinc-500 mt-1.5 max-w-xs">
          {errorMessage}
        </p>
      </div>

      <button
        onClick={() => {
          setOtpStatus("idle")
          setOtp(Array(6).fill(""))
        }}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition shadow-md"
      >
        Try Again
      </button>
    </div>
  )

  const renderOtpModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={otpStatus !== "verifying" ? closeModal : undefined}
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-zinc-100 z-10 overflow-hidden mx-4"
      >
        {otpStatus !== "verifying" && otpStatus !== "success" && (
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition"
          >
            <X size={18} />
          </button>
        )}

        {otpStatus === "idle" && renderOtpInputView()}
        {otpStatus === "verifying" && renderOtpVerifyingView()}
        {otpStatus === "success" && renderOtpSuccessView()}
        {otpStatus === "failure" && renderOtpFailureView()}
      </motion.div>
    </div>
  )

  if (checkingActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-zinc-500 font-semibold text-sm">Checking active deliveries...</p>
      </div>
    )
  }

  if (activeAssignment) {
    const order = activeAssignment.order
    const parsedOrderId = order._id
    const parsedDeliveryBoyId = activeAssignment.assignedTo

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.4 }}
        className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-24 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          
          {/* Active order panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
                <div>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    🚴‍♂️ Out for Delivery
                  </span>
                  <h1 className="text-2xl font-bold text-zinc-950 mt-2">
                    Order #{order._id.slice(-6)}
                  </h1>
                </div>
                <button
                  onClick={() => setIsOtpModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition active:scale-98 text-sm"
                >
                  Complete Delivery
                </button>
              </div>

              {/* Customer Contact */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Delivery Destination
                </h2>
                <div className="space-y-2 text-zinc-700 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-zinc-400" />
                    <span className="font-semibold text-zinc-800">{order.address.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-zinc-400" />
                    <a href={`tel:${order.address.mobile}`} className="hover:underline text-emerald-600 font-medium">
                      {order.address.mobile}
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">
                      {order.address.fullAddress}, {order.address.city}, {order.address.state} - {order.address.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Items Detail ({order.items.length})
                </h2>
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-150 space-y-2.5">
                  {order.items.map((item: { name: string; unit: string; quantity: number; price: string }, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm text-zinc-700">
                      <span>
                        {item.name} <span className="text-zinc-400 text-xs">({item.unit})</span>
                      </span>
                      <span className="font-semibold text-zinc-800">
                        {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center border-t pt-3 mt-3 font-bold text-zinc-950 text-base">
                    <span>Amount to Collect</span>
                    <span className="text-emerald-600">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Chat pane */}
          <div className="lg:h-[500px]">
            <DeliveryChat orderId={parsedOrderId} deliveryBoyId={parsedDeliveryBoyId} />
          </div>

        </div>

        {isOtpModalOpen && renderOtpModal()}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-24 pb-16"
    >
      <DeliveryBoyDashboard
        assignments={assignments}
        loading={loading}
        onAcceptSuccess={handleAcceptSuccess}
      />
    </motion.div>
  )
}
