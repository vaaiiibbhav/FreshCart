import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import UserModel from "../models/user.model"
import GroceryModel from "../models/grocery.model"

// Load env variables manually from .env.local
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ""
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1)
      }
      process.env[key] = value.trim()
    }
  })
}

const MONGODB_URL = process.env.MONGODB_URL
if (!MONGODB_URL) {
  console.error("❌ MONGODB_URL is missing in .env.local")
  process.exit(1)
}

async function run() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URL!)
    console.log("Connected successfully.")

    // Clear existing accounts with these emails to prevent unique key index errors
    const testEmails = ["admin@urbangrocer.com", "user@urbangrocer.com", "delivery@urbangrocer.com", "cook@urbangrocer.com"]
    console.log("Cleaning up previous test accounts if any exist...")
    await UserModel.deleteMany({ email: { $in: testEmails } })

    const hashedPassword = await bcrypt.hash("password123", 10)

    const testAccounts = [
      {
        name: "Test Admin",
        email: "admin@urbangrocer.com",
        password: hashedPassword,
        role: "admin" as const,
        mobile: "9999999999",
        provider: "credentials",
        location: {
          type: "Point",
          coordinates: [77.45618, 28.59270], // Coordinates matching test delivery locations in SocketServer logs
        },
        isOnline: false,
      },
      {
        name: "Test User",
        email: "user@urbangrocer.com",
        password: hashedPassword,
        role: "user" as const,
        mobile: "8888888888",
        provider: "credentials",
        location: {
          type: "Point",
          coordinates: [77.45618, 28.59270],
        },
        isOnline: false,
      },
      {
        name: "Test Delivery Boy",
        email: "delivery@urbangrocer.com",
        password: hashedPassword,
        role: "deliveryBoy" as const,
        mobile: "7777777777",
        provider: "credentials",
        location: {
          type: "Point",
          coordinates: [77.45618, 28.59270],
        },
        isOnline: false,
      },
      {
        name: "Test Cook",
        email: "cook@urbangrocer.com",
        password: hashedPassword,
        role: "cook" as const,
        mobile: "6666666666",
        provider: "credentials",
        isOnline: false,
      },
    ]

    console.log("Seeding test accounts...")
    for (const account of testAccounts) {
      const user = await UserModel.create(account)
      console.log(`✅ Created ${account.role} account: ${user.email} (Password: password123)`)
    }

    // Seeding products
    console.log("Cleaning up existing products...")
    await GroceryModel.deleteMany({})

    const testProducts = [
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

    console.log("Seeding test products...")
    for (const prod of testProducts) {
      await GroceryModel.create(prod)
      console.log(`✅ Created product: ${prod.name}`)
    }

    console.log("🎉 Seeding completed successfully.")
    process.exit(0)
  } catch (err: unknown) {
    console.error("❌ Seeding failed:", err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

run()
