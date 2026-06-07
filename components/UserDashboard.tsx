"use client"

import HeroSection from "./HeroSection"
import CategorySlider from "./CategorySlider"
import GroceryItemCard, { IGrocery } from "./GroceryItemCard"
import { motion } from "motion/react"

interface UserDashboardProps {
  groceries: IGrocery[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function UserDashboard({ groceries }: UserDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
    >
      <HeroSection />
      <CategorySlider />

      <div className="w-full max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Popular Grocery Items
        </h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        >
          {groceries.map((item: IGrocery, index: number) => (
            <GroceryItemCard key={index} item={item} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
