import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/lib/db"
import UserModel from "@/models/user.model"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json()
    if (!role || !["user", "deliveryBoy", "admin", "cook"].includes(role)) {
      return NextResponse.json({ error: "Invalid or missing role" }, { status: 400 })
    }

    await connectDB()

    // Map role to standard email & name
    let email = ""
    let name = ""
    let additionalProps = {}

    switch (role) {
      case "user":
        email = "demo.user@urbangrocer.com"
        name = "Demo Customer"
        break
      case "deliveryBoy":
        email = "demo.rider@urbangrocer.com"
        name = "Demo Rider"
        additionalProps = {
          isOnline: true,
          location: {
            type: "Point",
            coordinates: [77.45618, 28.59270], // Default active coordinate
          },
        }
        break
      case "admin":
        email = "demo.admin@urbangrocer.com"
        name = "Demo Manager"
        break
      case "cook":
        email = "demo.cook@urbangrocer.com"
        name = "Demo Chef"
        additionalProps = {
          isOnline: true,
        }
        break
    }

    let user = await UserModel.findOne({ email })
    if (!user) {
      const hashedPassword = await bcrypt.hash("demoPassword123", 10)
      user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role,
        mobile: role === "user" ? "9999911111" : role === "deliveryBoy" ? "9999922222" : role === "cook" ? "9999933333" : "9999944444",
        provider: "credentials",
        image: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        ...additionalProps,
      })
      console.log(`✅ Provisioned ${role} account: ${email}`)
    } else {
      // If delivery boy or cook already exists, ensure they are online
      if (role === "deliveryBoy" || role === "cook") {
        user.isOnline = true
        if (role === "deliveryBoy") {
          user.location = {
            type: "Point",
            coordinates: [77.45618, 28.59270],
          }
        }
        await user.save()
      }
    }

    return NextResponse.json({
      success: true,
      email,
      password: "demoPassword123",
      role,
    })
  } catch (err: any) {
    console.error("Demo provisioning error:", err)
    return NextResponse.json({ error: err.message || "Failed to provision demo user" }, { status: 500 })
  }
}
