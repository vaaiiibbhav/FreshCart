"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"

type Errors = {
  email?: string
  password?: string
  form?: string
}

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)


  // ---------------- VALIDATION ----------------
  const validate = () => {
    const e: Errors = {}

    if (!email.trim()) e.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email"

    if (!password.trim()) e.password = "Password is required"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ---------------- LOGIN ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setErrors({ form: "Invalid email or password" })
      setLoading(false)
      return
    }

    router.push("/")
  }

  // ---------------- DEMO LOGIN ----------------
  const handleDemoLogin = async (role: "user" | "admin" | "deliveryBoy" | "cook") => {
    setLoading(true)
    setErrors({})
    try {
      const res = await fetch("/api/auth/demo-provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision demo account")
      }
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (loginRes?.error) {
        setErrors({ form: "Demo login failed" })
        setLoading(false)
        return
      }
      router.push("/")
    } catch (err: any) {
      console.error(err)
      setErrors({ form: err.message || "Failed to log in as demo user" })
      setLoading(false)
    }
  }

  // ---------------- REDIRECT ----------------
  const handleRedirectToRegister = () => {
    setRedirecting(true)
    setTimeout(() => router.push("/register"), 120)
  }

  // ---------------- INPUT STYLE ----------------
  const inputClass = (field: string, error?: boolean) => {
    const base = "w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all duration-200"
    const state = error
      ? "border-rose-400 bg-rose-50 text-rose-900"
      : focused === field
      ? "border-indigo-500 ring-4 ring-indigo-100 bg-white shadow-md"
      : "border-gray-300 bg-gray-50 text-gray-800"
    return `${base} ${state}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F3F6FB] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-100"
      >
        {/* LEFT / BRAND SHOWCASE (Flexible flex-1 region) */}
        <div className="flex-1 p-8 sm:p-12 bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2 tracking-tight">Urban Grocer</h2>
            <p className="text-white/90 text-sm mb-4">
              A calmer, faster way to buy groceries online.
            </p>
          </div>

          <div className="my-auto space-y-5 max-w-md">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">10-Min Fast Delivery</h3>
              <p className="text-xs text-white/80">Fresh groceries delivered straight to your doorstep within minutes.</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Live Order Tracking</h3>
              <p className="text-xs text-white/80">Track your delivery rider in real-time from store to doorstep.</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Instant Chat Support</h3>
              <p className="text-xs text-white/80">Direct connection to your delivery partner and customer support.</p>
            </div>
          </div>

          <div className="text-xs border-t border-white/20 pt-6 text-white/60">
            © 2026 Urban Grocer. All rights reserved.
          </div>
        </div>

        {/* RIGHT / LOGIN SIDEBAR (Solid w-[400px] sidebar) */}
        <div className="w-full md:w-[400px] shrink-0 p-8 sm:p-12 bg-white flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-100">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Log in</h1>
          <p className="text-zinc-500 text-xs mt-1 mb-8">
            Continue to your premium customer dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FORM ERROR */}
            <AnimatePresence>
              {errors.form && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-rose-500 font-semibold"
                >
                  {errors.form}
                </motion.p>
              )}
            </AnimatePresence>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Email Address</label>
              <input
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={inputClass("email", !!errors.email)}
                placeholder="e.g. user@urbangrocer.com"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={inputClass("password", !!errors.password)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* SUBMIT */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-60 mt-2 shadow-sm hover:shadow active:scale-98 cursor-pointer"
            >
              {loading ? "Logging in…" : "Log in"}
            </motion.button>
          </form>

          {/* GOOGLE */}
          <button
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full mt-4 py-2.5 border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-white"
          >
            Continue with Google
          </button>

          {/* REGISTER */}
          <p className="text-xs text-center mt-5 text-zinc-500">
            Don’t have an account?{" "}
            <button
              onClick={handleRedirectToRegister}
              disabled={redirecting}
              className="text-indigo-600 font-bold hover:underline"
            >
              Create one
            </button>
          </p>

          {/* DEMO QUICK-LOGIN */}
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
              Demo Quick-Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("user")}
                className="py-2 px-2.5 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-green-50 hover:border-green-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                🛒 Customer
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("admin")}
                className="py-2 px-2.5 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-red-50 hover:border-red-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                💼 Manager
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("deliveryBoy")}
                className="py-2 px-2.5 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-indigo-50 hover:border-indigo-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                🚴 Rider
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("cook")}
                className="py-2 px-2.5 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-orange-50 hover:border-orange-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                🍳 Chef
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
