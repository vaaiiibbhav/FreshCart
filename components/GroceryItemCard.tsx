"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "@/redux/cartSlice"
import {
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

export interface IGrocery {
  _id: string
  name: string
  category: string
  price: number
  image: string
  unit: number
  description?: string
}

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

export default function GroceryItemCard({ item }: { item: IGrocery }) {
  const dispatch = useDispatch<AppDispatch>()
  const { cartData } = useSelector((state: RootState) => state.cart)
  const cartItem = cartData.find(ci => ci._id === item._id)
  
  const [imageError, setImageError] = useState(!item.image)

  const categoryConfig = categoryIconMap[item.category] || categoryIconMap["Others"]
  const CategoryIcon = categoryConfig.icon

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.02, filter: "brightness(1.02)" }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="
        bg-white rounded-2xl
        border border-gray-100/80
        shadow-sm hover:shadow-lg
        p-4 w-full flex flex-col justify-between h-full
        transition-all duration-300
      "
    >
      <div>
        {/* IMAGE */}
        <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
          {!imageError ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full aspect-square object-cover rounded-xl hover:scale-105 transition duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none"
              style={{ backgroundColor: categoryConfig.bgColor }}
            >
              <CategoryIcon 
                size={42} 
                style={{ color: categoryConfig.color }} 
                className="animate-pulse-subtle"
              />
              <span className="text-[9px] font-bold mt-2 uppercase tracking-wider line-clamp-1" style={{ color: categoryConfig.color }}>
                {item.category}
              </span>
            </div>
          )}
        </div>

        {/* CATEGORY */}
        <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 mt-3.5">
          {item.category}
        </p>

        {/* NAME */}
        <div className="h-12 flex items-center mt-1">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
            {item.name}
          </h3>
        </div>
      </div>

      <div className="mt-4">
        {/* UNIT + PRICE */}
        <div className="flex items-center justify-between border-t border-zinc-150 pt-3">
          <span className="text-xs text-gray-400">
            {item.unit} unit
          </span>

          <span className="text-green-700 font-bold">
            ₹{item.price}
          </span>
        </div>

        {/* CART CONTROL */}
        <div className="mt-3">
        {cartItem ? (
          <div
            className="
              flex items-center justify-between
              bg-green-50/80
              border border-green-200/60
              rounded-full
              px-3 py-1.5
            "
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() =>
                cartItem.quantity === 1
                  ? dispatch(removeFromCart(item._id!))
                  : dispatch(decreaseQuantity(item._id!))
              }
              className="
                text-green-700
                text-lg font-bold
                cursor-pointer
                h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-100/50 transition-colors
              "
            >
              −
            </motion.button>

            <span className="text-sm font-semibold text-green-700 select-none">
              {cartItem.quantity}
            </span>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() =>
                dispatch(addToCart({ ...item, quantity: 1 }))
              }
              className="
                text-green-700
                text-lg font-bold
                cursor-pointer
                h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-100/50 transition-colors
              "
            >
              +
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03, filter: "brightness(1.05)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              dispatch(addToCart({ ...item, quantity: 1 }))
            }
            className="
              w-full
              bg-green-600 hover:bg-green-700
              text-white
              rounded-full
              py-2 text-sm font-semibold
              transition-all
              cursor-pointer
              shadow-sm hover:shadow
            "
          >
            Add
          </motion.button>
        )}
      </div>
      </div>
    </motion.div>
  )
}
