import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserModel from "@/models/user.model"
import GroceryModel from "@/models/grocery.model"
import UserDashboard from "@/components/UserDashboard"
import EditRoleMobile from "@/components/EditRoleMobile"
import Nav from "@/components/Nav"

export const dynamic = "force-dynamic"

export default async function UserPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  await connectDB()
  const userDoc = await UserModel.findById(session.user.id)
  
  if (!userDoc || userDoc.role !== "user") {
    redirect("/unauthorized")
  }

  const user = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    role: userDoc.role as "user",
    image: userDoc.image ?? null,
    mobile: userDoc.mobile ?? null,
  }

  // If the user hasn't completed their mobile details, prompt them to complete
  if (!user.mobile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Nav user={user} />
        <main className="pt-24 flex items-center justify-center px-4">
          <EditRoleMobile />
        </main>
      </div>
    )
  }

  // Fetch groceries for UserDashboard
  const groceriesDocs = await GroceryModel.find({}).sort({ createdAt: -1 })
  const groceries = JSON.parse(JSON.stringify(groceriesDocs))

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Nav user={user} />
      <main className="pt-16 pb-16">
        <UserDashboard groceries={groceries} />
      </main>
    </div>
  )
}
