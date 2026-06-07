import UserModel from "@/models/user.model"
import connectDB from "./lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  await connectDB()
  const userDoc = await UserModel.findById(session.user.id)

  if (!userDoc) {
    redirect("/login")
  }

  const role = userDoc.role

  if (role === "admin") {
    redirect("/admin")
  } else if (role === "deliveryBoy") {
    redirect("/delivery")
  } else if (role === "cook") {
    redirect("/cook")
  } else {
    redirect("/user")
  }
}
