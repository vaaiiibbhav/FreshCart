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

    /* ---------- PARSE REQUEST ---------- */
    const contentType = req.headers.get("content-type") || ""
    let name = ""
    let category = ""
    let price = 0
    let unit = 0
    let imageUrl = ""
    let description = ""

    if (contentType.includes("application/json")) {
      const body = await req.json()
      name = body.name || ""
      category = body.category || ""
      price = Number(body.price)
      unit = Number(body.unit)
      imageUrl = body.image || ""
      description = body.description || ""
    } else {
      const formData = await req.formData()
      name = formData.get("name")?.toString() || ""
      category = formData.get("category")?.toString() || ""
      price = Number(formData.get("price"))
      unit = Number(formData.get("unit"))
      description = formData.get("description")?.toString() || ""
      const file = formData.get("image") as Blob | null

      if (!file) {
        return NextResponse.json(
          { error: "Image file is required for multipart uploads" },
          { status: 400 }
        )
      }

      const uploadedUrl = await uploadOnCloudinary(file)
      if (!uploadedUrl) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        )
      }
      imageUrl = uploadedUrl
    }

    /* ---------- VALIDATION ---------- */
    if (!name || !category || !imageUrl || !price || !unit) {
      return NextResponse.json(
        { error: "All fields (name, category, price, unit, and image) are required" },
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

    /* ---------- CREATE GROCERY ---------- */
    const grocery = await GroceryModel.create({
      name,
      category,
      price,
      unit,
      image: imageUrl,
      description,
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
