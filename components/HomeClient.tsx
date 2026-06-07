"use client"

import { useEffect, useState } from "react"
import Nav from "@/components/Nav"
import GeoUpdater from "@/components/GeoUpdater"
import UserDashboard from "@/components/UserDashboard"
import AdminDashboard from "@/components/AdminDashboard"
import DeliveryBoy from "@/components/DeliveryBoy"
import { IGrocery } from "./GroceryItemCard"

interface HomeClientProps {
  user: {
    id: string
    name: string
    role: "user" | "deliveryBoy" | "admin"
    image: string | null
    mobile: string | null
  }
  groceries: IGrocery[]
}

export default function HomeClient({ user, groceries }: HomeClientProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Return a matching minimal placeholder during server-side rendering
    return <div className="min-h-screen bg-[#F5F5F7]" />
  }

  return (
    <div>
      <Nav user={user} />
      <GeoUpdater userId={user.id} />
      {user.role === "user" && <UserDashboard groceries={groceries} />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  )
}
