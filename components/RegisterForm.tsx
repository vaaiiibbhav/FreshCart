"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Truck,
  MapPin,
  MessageCircle,
} from "lucide-react"
import { signIn } from "next-auth/react"

type RegisterFormProps = {
  previousStep(step: number): void
}

type Errors = {
  name?: string
  email?: string
  password?: string
}

export default function RegisterForm({ previousStep }: RegisterFormProps) {
  // ---------------- ROUTER ----------------
  const router = useRouter()

  // ---------------- STATE ----------------
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const e: Errors = {}

    if (!name.trim()) e.name = "Name is required"
    if (!email.trim()) e.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email"
    if (!password) e.password = "Password is required"
    else if (password.length < 6) e.password = "Minimum 6 characters"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      })
      console.log("Registered:", res.data)
      router.push("/login")
    } catch (err) {
      console.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- INPUT STYLE ----------------
  const inputClass = (field: string, error?: boolean) =>
    `
      w-full px-4 py-3 rounded-xl text-sm transition-all duration-200
      border outline-none
      ${
        error
          ? "border-rose-400 bg-rose-50"
          : focused === field
          ? "border-indigo-500 ring-4 ring-indigo-100 bg-white shadow-md"
          : "border-gray-300 bg-gray-50"
      }
    `

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] via-[#FDFEFF] to-[#F3F6FB] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* LEFT — BRAND */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-12 flex flex-col justify-center
                     bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500
                     text-white"
        >
          <h2 className="text-3xl font-semibold mb-4">Urban Grocer</h2>

          <p className="text-white/90 max-w-sm mb-10 leading-relaxed">
            Groceries delivered with transparency, speed, and a human-first
            experience — built for modern living.
          </p>

          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <Truck />
              <span>Fast & reliable delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin />
              <span>Real-time order tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle />
              <span>Live chat with delivery partner</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — REGISTER */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-12 flex flex-col justify-center"
        >
          {/* Back */}
          <button
            onClick={() => previousStep(1)}
            className="flex items-center gap-2 text-sm text-indigo-600 mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-2xl font-semibold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-2 mb-8 max-w-md">
            Join UrbanCart for faster checkout, live delivery chat,
            and real-time tracking.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full name
              </label>
              <motion.input
                layout
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                className={inputClass("name", !!errors.name)}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-rose-500 mt-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email address
              </label>
              <motion.input
                layout
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={inputClass("email", !!errors.email)}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-rose-500 mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>
              <div className="relative">
                <motion.input
                  layout
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={inputClass("password", !!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-rose-500 mt-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* SUBMIT */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl
                         bg-gradient-to-r from-indigo-600 to-blue-600
                         text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Join UrbanCart"}
            </motion.button>
          </form>

          {/* OR */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* GOOGLE LOGIN */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-gray-300
                       bg-white text-gray-700 font-medium shadow-sm
                       hover:bg-gray-50 flex items-center justify-center gap-3"
            onClick={()=>signIn("google",{callbackUrl:"/"})}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.36 1.53 8.3 3.23l6.17-6.17C34.41 2.66 29.64 0 24 0 14.64 0 6.6 5.4 2.74 13.3l7.19 5.59C11.6 13.06 17.3 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.21-.43-4.74H24v9.02h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.19 5.59c4.21-3.88 6.61-9.59 6.61-16.89z"/>
              <path fill="#FBBC05" d="M9.93 28.89a14.9 14.9 0 0 1 0-9.78l-7.19-5.59a23.97 23.97 0 0 0 0 20.96l7.19-5.59z"/>
              <path fill="#34A853" d="M24 48c5.64 0 10.41-1.86 13.88-5.05l-7.19-5.59c-2 1.34-4.56 2.13-6.69 2.13-6.7 0-12.4-3.56-14.07-8.39l-7.19 5.59C6.6 42.6 14.64 48 24 48z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* LOGIN REDIRECT */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-gray-500 text-center mt-6"
          >
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-indigo-600 font-medium hover:underline"
            >
              Log in
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
