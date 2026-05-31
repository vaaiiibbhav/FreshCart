"use client"

import { Bike, User, UserCog, Check } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const ROLES = [
  { id: "admin", label: "Admin", icon: UserCog },
  { id: "user", label: "User", icon: User },
  { id: "deliveryBoy", label: "Delivery Partner", icon: Bike },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
}

export default function EditRoleMobile() {
  const router = useRouter()
  const { update } = useSession()

  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [mobile, setMobile] = useState("")
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRole || !mobile) return

    try {
      setLoading(true)

      const res = await fetch("/api/user/edit-role-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, mobile }),
      })

      if (!res.ok) return

      await update({ role: selectedRole })
      router.push("/")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleAdminCheck = async () => {
      try {
        const res = await fetch("/api/check-for-admin")
        if (!res.ok) return

        const data = await res.json()
        if (data.message === "AdminExists") {
          setAdminExists(true)
        }
      } catch (error) {
        console.error(error)
      }
    }

    handleAdminCheck()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-[#0F2A32] via-[#123B45] to-[#F4F7F8]"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl px-6 py-10 sm:px-10"
      >
        <motion.div variants={item} className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            What’s your role?
          </h1>
          <p className="text-gray-500 mt-2">
            Please select your role to continue.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
        >
          {ROLES
            .filter(role => !(adminExists && role.id === "admin"))
            .map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id

              return (
                <motion.button
                  key={role.id}
                  variants={item}
                  onClick={() => setSelectedRole(role.id)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative h-36 rounded-xl border transition-all
                    flex flex-col items-center justify-center
                    ${
                      isSelected
                        ? "border-[#0F2A32] bg-[#F3F7F8] shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full
                      bg-[#0F2A32] flex items-center justify-center"
                    >
                      <Check size={14} className="text-white" />
                    </div>
                  )}

                  <Icon
                    size={32}
                    className={`mb-3 ${
                      isSelected ? "text-[#0F2A32]" : "text-gray-500"
                    }`}
                  />

                  <span className="text-sm font-medium text-gray-800">
                    {role.label}
                  </span>
                </motion.button>
              )
            })}
        </motion.div>

        <motion.div variants={item} className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile number
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
          />
        </motion.div>

        <motion.div variants={item} className="flex justify-center">
          <motion.button
            disabled={!selectedRole || !mobile || loading}
            onClick={handleSubmit}
            className="px-10 py-3 rounded-full bg-[#0F2A32]
              text-white font-medium shadow-md
              disabled:opacity-40"
          >
            {loading ? "Saving..." : "Continue"}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
