import connectDB from "@/app/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserModel from "@/models/user.model"
import DeliveryBoy from "@/components/DeliveryBoy"
import Nav from "@/components/Nav"

export const dynamic = "force-dynamic"

export default async function DeliveryPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  await connectDB()
  const userDoc = await UserModel.findById(session.user.id)
  
  if (!userDoc || userDoc.role !== "deliveryBoy") {
    redirect("/unauthorized")
  }

  const user = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    role: userDoc.role as "deliveryBoy",
    image: userDoc.image ?? null,
    mobile: userDoc.mobile ?? null,
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Nav user={user} />
      <main className="pt-16 pb-16">
        <DeliveryBoy />
      </main>
    </div>
  )
}
