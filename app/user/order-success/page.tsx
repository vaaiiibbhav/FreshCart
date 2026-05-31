"use client"

import { motion } from "motion/react"
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ShoppingBag,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white px-6 flex items-center justify-center">

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="
          w-full max-w-2xl
          bg-white
          rounded-3xl
          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
          border
          p-8 sm:p-10
        "
      >
        {/* ================= SUCCESS ICON ================= */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 160 }}
          className="
            mx-auto
            w-20 h-20
            rounded-full
            bg-green-100
            flex items-center justify-center
          "
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* ================= TITLE ================= */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="
            mt-6
            text-center
            text-2xl sm:text-3xl
            font-bold
            text-gray-900
          "
        >
          Your order is confirmed
        </motion.h1>

        {/* ================= SUBTEXT ================= */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="
            mt-3
            text-center
            text-gray-600
            text-sm sm:text-base
          "
        >
          We’ve received your order and started preparing it.  
          You’ll be notified as it moves forward.
        </motion.p>

        {/* ================= ORDER TIMELINE ================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-10 space-y-4"
        >
          <TimelineItem
            icon={<ClipboardList />}
            title="Order Placed"
            desc="We’ve received your order"
            active
          />
          <TimelineItem
            icon={<Package />}
            title="Preparing"
            desc="Items are being packed"
            active
          />
          <TimelineItem
            icon={<Truck />}
            title="Out for Delivery"
            desc="Delivery partner on the way"
          />
        </motion.div>

        {/* ================= ACTIONS ================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-10 space-y-4"
        >
          {/* PRIMARY */}
          <Link
            href="/user/my-orders"
            className="
              block w-full
              text-center
              py-3.5
              rounded-full
              bg-green-600
              text-white
              font-medium
              hover:bg-green-700
              hover:shadow-lg
              transition
            "
          >
            Track your order
          </Link>

          {/* SECONDARY */}
          <Link
            href="/"
            className="
              flex items-center justify-center gap-2
              text-sm font-medium
              text-green-700
              hover:text-green-900
              transition
            "
          >
            <Home size={16} />
            Continue shopping
          </Link>
        </motion.div>

        {/* ================= FOOTER TRUST ================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="
            mt-10 pt-6
            border-t
            text-center
            text-xs
            text-gray-500
          "
        >
          Need help? Visit your orders page or contact support anytime.
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ================= TIMELINE ITEM ================= */

function TimelineItem({
  icon,
  title,
  desc,
  active = false,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  active?: boolean
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          ${active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}
        `}
      >
        {icon}
      </div>

      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}
