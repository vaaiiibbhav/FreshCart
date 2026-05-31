import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/lib/db"
import uploadOnCloudinary from "@/app/lib/cloudinary"
import GroceryModel from "@/models/grocery.model"
import { auth } from "@/auth"

/* ---------- ALLOWED CATEGORIES ---------- */
const ALLOWED_CATEGORIES = [
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

export async function POST(req: NextRequest) {
  try {
    /* ---------- AUTH ---------- */
    const session = await auth()
    console.log(session)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* ---------- DB ---------- */
    await connectDB()

    /* ---------- FORM DATA ---------- */
    const formData = await req.formData()

    const name = formData.get("name")?.toString()
    const category = formData.get("category")?.toString()
    const price = Number(formData.get("price"))
    const unit = Number(formData.get("unit"))
    const file = formData.get("image") as Blob | null

    /* ---------- VALIDATION ---------- */
    if (!name || !category || !file || !price || !unit) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      )
    }

    if (price <= 0 || unit <= 0) {
      return NextResponse.json(
        { error: "Price and unit must be greater than zero" },
        { status: 400 }
      )
    }

    /* ---------- IMAGE UPLOAD ---------- */
    const imageUrl = await uploadOnCloudinary(file)

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      )
    }

    /* ---------- CREATE GROCERY ---------- */
    const grocery = await GroceryModel.create({
      name,
      category,
      price,
      unit,
      image: imageUrl,
    })

    /* ---------- RESPONSE ---------- */
    return NextResponse.json(
      {
        message: "Grocery added successfully",
        grocery,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("ADD GROCERY ERROR:", error)
    return NextResponse.json(
      { error: "Failed to add grocery" },
      { status: 500 }
    )
  }
}
