"use client"

import {
  Apple,
  Milk,
  Coffee,
  Cookie,
  Cake,
  Wheat,
  Soup,
  Fish,
  Flame,
  Home,
  Package,
  Baby,
  Drumstick,
  Snowflake,
  Boxes,
} from "lucide-react"
import { motion } from "motion/react"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type CategoryItem = {
  name: string
  icon: React.ElementType
  color: string
}

/* -------------------------------------------------------------------------- */
/*                              CATEGORY DATA                                 */
/* -------------------------------------------------------------------------- */

const CATEGORIES: CategoryItem[] = [
  { name: "Fruits & Vegetables", icon: Apple, color: "#22c55e" },
  { name: "Dairy & Eggs", icon: Milk, color: "#60a5fa" },
  { name: "Beverages", icon: Coffee, color: "#f59e0b" },
  { name: "Snacks & Cookies", icon: Cookie, color: "#fb923c" },
  { name: "Bakery", icon: Cake, color: "#f472b6" },
  { name: "Pulses & Legumes", icon: Wheat, color: "#84cc16" },
  { name: "Grains & Cereals", icon: Soup, color: "#eab308" },
  { name: "Seafood", icon: Fish, color: "#38bdf8" },
  { name: "Spices & Masalas", icon: Flame, color: "#ef4444" },
  { name: "Household Essentials", icon: Home, color: "#64748b" },
  { name: "Instant & Packaged Food", icon: Package, color: "#8b5cf6" },
  { name: "Baby & Pet care", icon: Baby, color: "#ec4899" },
  { name: "Meat & Poultry", icon: Drumstick, color: "#dc2626" },
  { name: "Frozen", icon: Snowflake, color: "#06b6d4" },
  { name: "Others", icon: Boxes, color: "#6b7280" },
]

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function CategorySlider() {
  /**
   * Duplicate categories to create a seamless infinite loop.
   * This avoids any "jump back" feeling.
   */
  const loopedCategories = [...CATEGORIES, ...CATEGORIES]

  return (
    <section className="w-full py-12 overflow-hidden">
      {/* ------------------------------ Heading ------------------------------ */}
      <motion.h2
        className="text-2xl font-semibold text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        🛒 Shop by Category
      </motion.h2>

      {/* --------------------------- Marquee Wrapper -------------------------- */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-6 w-max"
          /**
           * Animation starts ONLY when component enters viewport.
           * Smooth, linear, calming motion.
           */
          initial={{ x: "0%" }}
          whileInView={{ x: "-50%" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {loopedCategories.map((item, index) => (
            <CategoryCard
              key={`${item.name}-${index}`}
              item={item}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                            CATEGORY CARD UI                                 */
/* -------------------------------------------------------------------------- */

function CategoryCard({ item }: { item: CategoryItem }) {
  const Icon = item.icon

  return (
    <div
      className="
        min-w-[150px] sm:min-w-[160px]
        h-[150px] sm:h-[160px]
        rounded-2xl
        bg-white
        border
        shadow-sm
        flex flex-col
        items-center
        justify-center
        gap-3
        cursor-pointer
        transition
        hover:shadow-md
        hover:-translate-y-1
      "
    >
      {/* Icon */}
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${item.color}20` }}
      >
        <Icon
          className="w-6 h-6"
          style={{ color: item.color }}
        />
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-700 text-center px-2">
        {item.name}
      </p>
    </div>
  )
}
4