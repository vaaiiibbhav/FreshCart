"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Apple,
  Milk,
  Coffee,
  Cookie,
  Cake,
  Wheat,
  Soup,
  Fish,
  Flame,
  Home,
  Package,
  Baby,
  Drumstick,
  Snowflake,
  Boxes,
  LucideIcon
} from "lucide-react"

const categoryIconMap: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  "Fruits & Vegetables": { icon: Apple, color: "#10b981", bgColor: "#f0fdf4" },
  "Dairy & Eggs": { icon: Milk, color: "#3b82f6", bgColor: "#eff6ff" },
  "Beverages": { icon: Coffee, color: "#f59e0b", bgColor: "#fffbeb" },
  "Snacks & Cookies": { icon: Cookie, color: "#f97316", bgColor: "#fff7ed" },
  "Bakery": { icon: Cake, color: "#ec4899", bgColor: "#fdf2f8" },
  "Pulses & Legumes": { icon: Wheat, color: "#84cc16", bgColor: "#f7fee7" },
  "Grains & Cereals": { icon: Soup, color: "#eab308", bgColor: "#fefcbf" },
  "Seafood": { icon: Fish, color: "#06b6d4", bgColor: "#f0f9ff" },
  "Spices & Masalas": { icon: Flame, color: "#ef4444", bgColor: "#fef2f2" },
  "Household Essentials": { icon: Home, color: "#64748b", bgColor: "#f8fafc" },
  "Instant & Packaged Food": { icon: Package, color: "#8b5cf6", bgColor: "#f5f3ff" },
  "Baby & Pet care": { icon: Baby, color: "#d946ef", bgColor: "#fdf4ff" },
  "Meat & Poultry": { icon: Drumstick, color: "#dc2626", bgColor: "#fef2f2" },
  "Frozen": { icon: Snowflake, color: "#0891b2", bgColor: "#ecfeff" },
  "Others": { icon: Boxes, color: "#6b7280", bgColor: "#f9fafb" }
}
import { motion, AnimatePresence } from "motion/react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "@/redux/cartSlice"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { cartData } = useSelector((state: RootState) => state.cart)
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({})

  const subtotal = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">

        {/* BACK */}
        <Link
          href="/"
          className="
            inline-flex items-center gap-2
            text-green-700 font-medium
            cursor-pointer
            hover:text-green-900
            transition-colors
          "
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-center mt-6 mb-8 sm:mb-10"
        >
          🛒 Your Shopping Cart
        </motion.h1>

        <AnimatePresence mode="wait">
          {cartData.length === 0 ? (
            /* EMPTY */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-xl font-semibold mb-2">
                Your cart is empty
              </h2>

              <p className="text-gray-500 mb-6 max-w-sm">
                Add fresh groceries and we’ll deliver them fast.
              </p>

              <Link
                href="/shop"
                className="
                  px-6 py-3 rounded-full
                  bg-green-600 text-white
                  font-medium
                  cursor-pointer
                  hover:bg-green-700
                  hover:shadow-lg
                  transition-all
                "
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* CART ITEMS */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cartData.map(item => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.25 }}
                      className="
                        bg-white rounded-2xl
                        border border-black/10
                        p-4 sm:p-5
                        flex flex-col sm:flex-row
                        gap-4 sm:gap-5
                        hover:shadow-md
                        transition-shadow
                      "
                    >
                      {/* IMAGE */}
                      <div className="relative w-16 h-16 shrink-0 mx-auto sm:mx-0 flex items-center justify-center rounded-lg overflow-hidden bg-gray-50">
                        {!erroredImages[item._id] ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                            onError={() => setErroredImages(prev => ({ ...prev, [item._id]: true }))}
                          />
                        ) : (() => {
                          const catConf = categoryIconMap[item.category] || categoryIconMap["Others"]
                          const CatIcon = catConf.icon
                          return (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: catConf.bgColor }}
                            >
                              <CatIcon size={24} style={{ color: catConf.color }} />
                            </div>
                          )
                        })()}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.unit} unit
                        </p>
                        <p className="text-green-700 font-bold mt-1">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="
                        flex items-center justify-between
                        sm:justify-end
                        gap-4
                      ">
                        {/* QUANTITY */}
                        <div className="
                          flex items-center gap-3
                          bg-green-100
                          px-3 py-1.5
                          rounded-full
                        ">
                          <button
                            onClick={() =>
                              dispatch(decreaseQuantity(item._id))
                            }
                            className="
                              p-1 rounded-full
                              cursor-pointer
                              hover:bg-green-200
                              transition-colors
                            "
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-[20px] text-center font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              dispatch(addToCart({ ...item, quantity: 1 }))
                            }
                            className="
                              p-1 rounded-full
                              cursor-pointer
                              hover:bg-green-600
                              hover:text-white
                              transition-all
                            "
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* REMOVE */}
                        <button
                          onClick={() =>
                            dispatch(removeFromCart(item._id))
                          }
                          className="
                            p-2 rounded-full
                            cursor-pointer
                            hover:bg-red-100
                            transition-colors
                          "
                        >
                          <Trash2 className="text-red-600" size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* SUMMARY */}
              <motion.div
                layout
                className="
                  bg-white rounded-2xl
                  border border-black/10
                  p-6 h-fit
                  lg:sticky lg:top-24
                "
              >
                <h3 className="text-lg font-semibold mb-4">
                  Order Summary
                </h3>

                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-3 mb-6">
                  <span>Total</span>
                  <span className="text-green-700">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  className="
                    w-full min-h-[48px]
                    rounded-full
                    bg-green-600 text-white
                    font-medium
                    cursor-pointer
                    hover:bg-green-700
                    hover:shadow-lg
                    transition-all
                  "
                  onClick={() => router.push("/user/checkout")}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => dispatch(clearCart())}
                  className="
                    block mx-auto mt-4
                    cursor-pointer
                    text-red-500
                    hover:text-red-700
                    hover:underline
                    transition-colors
                  "
                >
                  Clear Cart
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
