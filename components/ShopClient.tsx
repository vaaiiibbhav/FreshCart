"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import GroceryItemCard, { IGrocery } from "./GroceryItemCard"

interface ShopClientProps {
  groceries: IGrocery[]
}

const CATEGORIES = [
  "All",
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Beverages",
  "Snacks & Cookies",
  "Bakery",
  "Pulses & Legumes",
  "Grains & Cereals",
  "Seafood",
  "Spices & Masalas",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet care",
  "Meat & Poultry",
  "Frozen",
  "Others",
]

export default function ShopClient({ groceries }: ShopClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get("category")

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"none" | "price-asc" | "price-desc">("none")

  const selectedCategory = useMemo(() => {
    if (categoryParam) {
      const matched = CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      )
      if (matched) return matched
    }
    return "All"
  }, [categoryParam])

  // Filter and sort groceries client-side
  const filteredAndSortedGroceries = useMemo(() => {
    let result = [...groceries]

    // 1. Category filter
    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory)
    }

    // 2. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )
    }

    // 3. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [groceries, selectedCategory, searchQuery, sortBy])

  return (
    <div className="space-y-8">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search fresh groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm text-zinc-800"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="relative w-full md:w-auto flex items-center gap-2">
          <ArrowUpDown className="text-zinc-400 w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "none" | "price-asc" | "price-desc")}
            className="w-full md:w-48 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-700 outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all cursor-pointer"
          >
            <option value="none">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Horizontal Category Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Categories</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (cat === "All") {
                    params.delete("category")
                  } else {
                    params.set("category", cat)
                  }
                  router.replace(`/shop?${params.toString()}`, { scroll: false })
                }}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200 shadow-sm border
                  ${
                    isActive
                      ? "bg-green-600 border-green-600 text-white shadow-green-100 font-semibold scale-105"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Groceries */}
      <motion.div layout className="relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedGroceries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-zinc-200/60 shadow-sm"
            >
              <Search className="w-12 h-12 text-zinc-300 mb-3 stroke-1" />
              <p className="text-zinc-600 text-base font-semibold">No groceries match your filters</p>
              <p className="text-zinc-400 text-xs mt-1">Try modifying your search queries or selecting a different category.</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {filteredAndSortedGroceries.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.22 }}
                >
                  <GroceryItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
