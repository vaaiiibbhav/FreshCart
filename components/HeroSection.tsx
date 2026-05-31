"use client"

import Image from "next/image"
import Link from "next/link"
import { Leaf, Truck, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

type Slide = {
  id: number
  title: string
  description: string
  image: string
  cta: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Fresh Fruits, Delivered Daily",
    description:
      "Handpicked fruits sourced directly from trusted farms and delivered fresh to your doorstep.",
    image:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=2400&q=80",
    cta: "Shop Fruits",
  },
  {
    id: 2,
    title: "Pure & Organic Vegetables",
    description:
      "Clean, organic vegetables carefully selected to keep your family healthy every day.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=80",
    cta: "Shop Vegetables",
  },
  {
    id: 3,
    title: "Groceries at Lightning Speed",
    description:
      "From store to your door in minutes. Freshness and speed you can rely on.",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e17b?auto=format&fit=crop&w=2400&q=80",
    cta: "Start Shopping",
  },
]

export default function HeroSection() {
  const user = useSelector((state:RootState)=>state.user)
  console.log(user)

  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto slide
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [mounted])

  if (!mounted) return null

  const slide = slides[current]

  return (
    <section
      className="
        relative w-full overflow-hidden
        h-[65vh] min-h-[420px]
        sm:h-[70vh] sm:min-h-[480px]
        lg:h-[80vh] lg:min-h-[560px]
      "
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={current === 0}
            loading={current === 0 ? "eager" : "lazy"}
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

          {/* Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="max-w-2xl text-white space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600/20 text-green-400 text-sm">
                <Leaf size={14} />
                Fresh • Fast • Trusted
              </div>

              {/* Title */}
              <h1 className="font-bold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg text-white/90">
                {slide.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/shop"
                  className="
                    inline-flex items-center gap-2
                    bg-green-600 hover:bg-green-700
                    px-7 py-3 rounded-full
                    text-white font-medium
                    shadow-lg transition
                  "
                >
                  <Truck size={18} />
                  {slide.cta}
                </Link>

                <div className="flex items-center gap-2 text-sm text-white/70">
                  <ShieldCheck size={18} />
                  Secure payments & quality assured
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === current
                ? "w-8 bg-green-500"
                : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
