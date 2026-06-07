import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserModel from "@/models/user.model"
import AdminDashboard from "@/components/AdminDashboard"
import Nav from "@/components/Nav"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  await connectDB()
  const userDoc = await UserModel.findById(session.user.id)
  
  if (!userDoc || userDoc.role !== "admin") {
    redirect("/unauthorized")
  }

  const user = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    role: userDoc.role as "admin",
    image: userDoc.image ?? null,
    mobile: userDoc.mobile ?? null,
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Nav user={user} />
      <main className="pt-6">
        <AdminDashboard />
      </main>
    </div>
  )
}
