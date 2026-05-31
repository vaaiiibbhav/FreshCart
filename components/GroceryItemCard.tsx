"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "@/redux/cartSlice"

interface IGrocery {
  _id?: string
  name: string
  category: string
  price: number
  image: string
  unit: number
}

export default function GroceryItemCard({ item }: { item: IGrocery }) {
  const dispatch = useDispatch<AppDispatch>()
  const { cartData } = useSelector((state: RootState) => state.cart)
  const cartItem = cartData.find(ci => ci._id === item._id)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="
        bg-white rounded-2xl
        border border-gray-100
        shadow-sm hover:shadow-md
        p-4 w-full
      "
    >
      {/* IMAGE */}
      <div className="relative h-36 flex items-center justify-center">
        <Image
          src={item.image}
          alt={item.name}
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* CATEGORY */}
      <p className="text-xs text-gray-400 mt-2">
        {item.category}
      </p>

      {/* NAME */}
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
        {item.name}
      </h3>

      {/* UNIT + PRICE */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {item.unit} unit
        </span>

        <span className="text-green-700 font-semibold">
          ₹{item.price}
        </span>
      </div>

      {/* CART CONTROL */}
      <div className="mt-3">
        {cartItem ? (
          <div
            className="
              flex items-center justify-between
              bg-green-50
              border border-green-200
              rounded-full
              px-4 py-2
            "
          >
            <button
              onClick={() =>
                cartItem.quantity === 1
                  ? dispatch(removeFromCart(item._id))
                  : dispatch(decreaseQuantity(item._id))
              }
              className="
                text-green-700
                text-lg font-medium
                cursor-pointer
              "
            >
              −
            </button>

            <span className="text-sm font-medium text-green-700">
              {cartItem.quantity}
            </span>

            <button
              onClick={() =>
                dispatch(addToCart({ ...item, quantity: 1 }))
              }
              className="
                text-green-700
                text-lg font-medium
                cursor-pointer
              "
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              dispatch(addToCart({ ...item, quantity: 1 }))
            }
            className="
              w-full
              bg-green-600 hover:bg-green-700
              text-white
              rounded-full
              py-2 text-sm font-medium
              transition
              cursor-pointer
            "
          >
            Add
          </button>
        )}
      </div>
    </motion.div>
  )
}
