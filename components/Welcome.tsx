"use client"

import React from "react"
import { motion } from "motion/react"
import {
  ShoppingCart,
  CheckCircle,
  MapPin,
  MessageCircle,
  ArrowRight,
} from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

type WelcomProps = {
  nextStep(s : number) : void
}

export default function Welcome({nextStep}:WelcomProps) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-14 items-center"
      >
        {/* LEFT SECTION */}
        <motion.div variants={item}>
          <motion.div
            variants={item}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-3 rounded-xl bg-[#E6F0FF] text-[#2F6FED]">
              <ShoppingCart size={22} />
            </div>
            <span className="text-sm font-medium text-[#2F6FED]">
              Urban Grocer
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl font-semibold text-[#1F2937] leading-tight mb-6"
          >
            A calmer way to buy <br />
            groceries online
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg text-[#4B5563] max-w-md mb-8 leading-relaxed"
          >
            Fresh groceries delivered with transparency, control,
            and real-time visibility — designed to feel effortless.
          </motion.p>

          <motion.div variants={item} className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg bg-[#2F6FED] text-white font-medium shadow-sm flex items-center gap-2"
              onClick={()=>nextStep(2)}
            >
              Start shopping <ArrowRight size={16} />
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: "#EEF2F7" }}
              className="px-6 py-3 rounded-lg border border-[#D1D5DB] text-[#374151] font-medium"
            >
              Browse categories
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div variants={item} className="relative">
          <div className="absolute -top-6 -left-6 w-full h-full bg-[#E6F0FF] rounded-3xl" />

          <motion.div
            variants={container}
            className="relative bg-white rounded-3xl p-10 shadow-md"
          >
            <motion.p
              variants={item}
              className="text-sm text-[#6B7280] mb-6"
            >
              Built for real-world convenience
            </motion.p>

            <motion.ul
              variants={container}
              className="space-y-5 text-[#374151]"
            >
              <motion.li
                variants={item}
                className="flex items-center gap-3"
              >
                <CheckCircle className="text-[#2F6FED]" size={20} />
                <span>Real-time order location tracking</span>
              </motion.li>

              <motion.li
                variants={item}
                className="flex items-center gap-3"
              >
                <CheckCircle className="text-[#2F6FED]" size={20} />
                <span>Live chat with your delivery partner</span>
              </motion.li>

              <motion.li
                variants={item}
                className="flex items-center gap-3"
              >
                <CheckCircle className="text-[#2F6FED]" size={20} />
                <span>Instant status updates with delivery confirmation</span>
              </motion.li>

              <motion.li
                variants={item}
                className="flex items-center gap-3"
              >
                <CheckCircle className="text-[#2F6FED]" size={20} />
                <span>Full transparency from checkout to doorstep</span>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
