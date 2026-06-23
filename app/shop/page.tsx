import { Suspense } from "react"
import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import UserModel from "@/models/user.model"
import GroceryModel from "@/models/grocery.model"
import Nav from "@/components/Nav"
import ShopClient from "@/components/ShopClient"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ShopPage() {
  const session = await auth()
  let user = null

  await connectDB()

  if (session?.user?.id) {
    const userDoc = await UserModel.findById(session.user.id)
    if (userDoc) {
      user = {
        id: userDoc._id.toString(),
        name: userDoc.name,
        role: userDoc.role,
        image: userDoc.image ?? null,
        mobile: userDoc.mobile ?? null,
      }
    }
  }

  const groceries = await GroceryModel.find({}).sort({ createdAt: -1 })
  const plainGroceries = JSON.parse(JSON.stringify(groceries))

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Nav user={user} />
      
      <main className="w-[90%] md:w-[85%] mx-auto mt-24 pb-16 space-y-8">
        {/* Banner/Header */}
        <div className="border-b pb-5">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Browse Groceries
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Fresh groceries delivered to your door in 10 minutes.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600" size={32} />
            <p className="text-zinc-500 text-sm mt-2">Loading catalog...</p>
          </div>
        }>
          <ShopClient groceries={plainGroceries} />
        </Suspense>
      </main>
    </div>
  )
}
