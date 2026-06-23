import { NextResponse } from "next/server"
import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import UserModel from "@/models/user.model"
import GroceryModel from "@/models/grocery.model"
import OrderModel from "@/models/order.model"
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model"
import ChatRoom from "@/models/chatRoom.model"
import Message from "@/models/message.model"

const RESET_PRODUCTS = [
  {
    name: "Fresh Apples",
    category: "Fruits & Vegetables",
    price: 120,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758643/urbangrocer/apples.jpg",
    description: "Crisp and juicy fresh red apples, handpicked and rich in natural nutrients.",
  },
  {
    name: "Organic Carrots",
    category: "Fruits & Vegetables",
    price: 60,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758658/urbangrocer/carrots.jpg",
    description: "Sweet, crunchy organic carrots sourced fresh from certified farms.",
  },
  {
    name: "Fresh Whole Milk",
    category: "Dairy & Eggs",
    price: 65,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758645/urbangrocer/milk.jpg",
    description: "Pure, wholesome pasteurized full-cream milk in a premium glass bottle.",
  },
  {
    name: "Chocolate Chip Cookies",
    category: "Snacks & Cookies",
    price: 85,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758645/urbangrocer/cookies.jpg",
    description: "Delightfully crunchy cookies packed with premium rich dark chocolate chips.",
  },
  {
    name: "Crunchy Potato Chips",
    category: "Snacks & Cookies",
    price: 40,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758676/urbangrocer/chips.jpg",
    description: "Thin, crispy golden potato chips lightly salted for the perfect crunch.",
  },
  {
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 45,
    unit: 1,
    image: "https://res.cloudinary.com/dknifag9q/image/upload/v1780758647/urbangrocer/bread.jpg",
    description: "Artisanal whole wheat bread baked fresh daily, offering a healthy and hearty flavor.",
  },
]

export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // 1. Delete all transactional sandbox data
    await OrderModel.deleteMany({})
    await DeliveryAssignmentModel.deleteMany({})
    await ChatRoom.deleteMany({})
    await Message.deleteMany({})

    // 2. Reset user online statuses & positions
    await UserModel.updateMany(
      {},
      {
        $set: {
          isOnline: false,
          socketId: null,
        },
      }
    )

    // Ensure demo user roles are reset to active online
    await UserModel.updateOne(
      { email: "demo.rider@urbangrocer.com" },
      {
        $set: {
          isOnline: true,
          location: {
            type: "Point",
            coordinates: [77.45618, 28.59270],
          },
        },
      }
    )
    await UserModel.updateOne(
      { email: "demo.cook@urbangrocer.com" },
      {
        $set: {
          isOnline: true,
        },
      }
    )

    // 3. Clear and re-seed products
    await GroceryModel.deleteMany({})
    await GroceryModel.insertMany(RESET_PRODUCTS)

    return NextResponse.json({
      success: true,
      message: "Sandbox purged and reseeded successfully.",
    })
  } catch (err: unknown) {
    console.error("Reset sandbox error:", err)
    const errorMessage = err instanceof Error ? err.message : "Failed to reset sandbox"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
