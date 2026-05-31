"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Eye, EyeOff, Truck, MapPin, MessageCircle } from "lucide-react"
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

  // ---------------- REDIRECT ----------------
  const handleRedirectToRegister = () => {
    setRedirecting(true)
    setTimeout(() => router.push("/register"), 120)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F3F6FB] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden"
      >
        {/* LEFT */}
        <div className="p-12 bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
          <h2 className="text-3xl font-semibold mb-4">Urban Grocer</h2>
          <p className="text-white/90 mb-10">
            Manage orders, track deliveries, and chat in real time.
          </p>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3"><Truck /> Fast delivery</div>
            <div className="flex items-center gap-3"><MapPin /> Live tracking</div>
            <div className="flex items-center gap-3"><MessageCircle /> Chat support</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-gray-500 mt-2 mb-8">
            Continue to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FORM ERROR */}
            <AnimatePresence>
              {errors.form && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-rose-500"
                >
                  {errors.form}
                </motion.p>
              )}
            </AnimatePresence>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={inputClass("email", !!errors.email)}
              />
              {errors.email && (
                <p className="text-sm text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
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
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* SUBMIT */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </motion.button>
          </form>

          {/* GOOGLE */}
          <button
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full mt-6 py-3 border rounded-xl"
          >
            Continue with Google
          </button>

          {/* REGISTER */}
          <p className="text-sm text-center mt-6">
            Don’t have an account?{" "}
            <button
              onClick={handleRedirectToRegister}
              disabled={redirecting}
              className="text-indigo-600 font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
