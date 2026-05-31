"use client"

import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const CATEGORIES = [
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

const UNITS = [1, 2, 5, 10]

export default function AddGroceryPage() {
  const router = useRouter();

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [unit, setUnit] = useState<number | "">("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /* ---------- IMAGE ---------- */
  function onImageSelect(file: File) {
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  /* ---------- SUBMIT ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !category || !price || !unit || !imageFile) {
      alert("All fields are required")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", name)
      formData.append("category", category)
      formData.append("price", String(price))
      formData.append("unit", String(unit))
      formData.append("image", imageFile)

      const res = await fetch("/api/auth/admin/add-grocery", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add grocery")
      }

      alert("Grocery added successfully")
      router.push("/");

      // Reset form
      setName("")
      setCategory("")
      setPrice("")
      setUnit("")
      setImageFile(null)
      setPreview(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-white px-4 py-14">
      {/* Back */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-green-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to home</span>
      </Link>

      <div className="flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            w-full max-w-3xl
            bg-white rounded-2xl
            border border-green-100
            shadow-[0_20px_60px_rgba(0,0,0,0.08)]
            p-6 sm:p-8 space-y-8
          "
        >
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Add Grocery Item
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add accurate data to maintain inventory quality
            </p>
          </div>

          {/* NAME */}
          <Input label="Grocery Name" value={name} onChange={setName} />

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>

            {/* Mobile */}
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="md:hidden w-full rounded-lg border px-3 py-2.5 text-sm"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-3 gap-3">
              {CATEGORIES.map(c => (
                <OptionCard
                  key={c}
                  label={c}
                  selected={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          </div>

          {/* PRICE */}
          <Input
            label="Price"
            type="number"
            value={price}
            onChange={v => setPrice(Number(v))}
          />

          {/* UNIT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>

            {/* Mobile */}
            <select
              value={unit}
              onChange={e => setUnit(Number(e.target.value))}
              className="md:hidden w-full rounded-lg border px-3 py-2.5 text-sm"
            >
              <option value="">Select unit</option>
              {UNITS.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* Desktop */}
            <div className="hidden md:flex gap-3">
              {UNITS.map(u => (
                <OptionCard
                  key={u}
                  label={`${u}`}
                  selected={unit === u}
                  onClick={() => setUnit(u)}
                />
              ))}
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grocery Image *
            </label>

            <label
              className="
                flex flex-col items-center justify-center
                border-2 border-dashed border-green-200
                rounded-xl p-6 cursor-pointer
                hover:bg-green-50 transition
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 rounded-lg object-cover"
                />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-green-600 mb-2" />
                  <p className="text-sm text-green-700">Upload image</p>
                </>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e =>
                  e.target.files && onImageSelect(e.target.files[0])
                }
              />
            </label>
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="
              w-full rounded-xl
              bg-gradient-to-r from-green-600 to-green-500
              py-3 text-white font-medium
              flex items-center justify-center gap-2
              disabled:opacity-60
            "
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Grocery
          </button>
        </motion.form>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: any
  onChange: (v: any) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full rounded-lg border px-3 py-2.5 text-sm"
      />
    </div>
  )
}

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-3 rounded-xl border text-sm transition text-left
        ${
          selected
            ? "bg-green-600 text-white border-green-600"
            : "bg-white border-gray-200 hover:bg-green-50"
        }
      `}
    >
      {label}
    </button>
  )
}
