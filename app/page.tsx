import UserModel from "@/models/user.model"
import connectDB from "./lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import EditRoleMobile from "@/components/EditRoleMobile"
import Nav from "@/components/Nav"
import UserDashboard from "@/components/UserDashboard"
import AdminDashboard from "@/components/AdminDashboard"
import DeliveryBoy from "@/components/DeliveryBoy"
import GeoUpdater from "@/components/GeoUpdater"

export default async function Home() {
  await connectDB()

  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userDoc = await UserModel.findById(session.user.id)

  if (!userDoc) {
    redirect("/login")
  }
  const user = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    role: userDoc.role,
    image: userDoc.image ?? null,
    mobile: userDoc.mobile ?? null,
  }
  const inComplete = user.role === "user" && !user.mobile

  if (inComplete) {
    return <EditRoleMobile />
  }

  return (
    <div>
      <Nav user={user} />
      <GeoUpdater userId={user.id} />
      {user.role === "user" && <UserDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  )
}
