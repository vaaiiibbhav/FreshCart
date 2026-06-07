"use client"

import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Search,
  Loader2,
  LocateFixed,
  ShoppingBag,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useRef, useState } from "react"
import axios from "axios"

const CheckoutMap = dynamic(() => import("@/components/CheckoutMap"), {
  ssr: false,
})

const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0)

export default function CheckoutPage() {
  const router = useRouter()
  const { userData } = useSelector((s: RootState) => s.user)
  const { cartData } = useSelector((s: RootState) => s.cart)

  const fieldMeta: Record<string, { label: string; placeholder: string; colSpan?: string }> = {
    fullName: { label: "Recipient Name", placeholder: "e.g. John Doe", colSpan: "md:col-span-1" },
    mobile: { label: "Mobile Number", placeholder: "e.g. 9876543210", colSpan: "md:col-span-1" },
    address: { label: "Street Address", placeholder: "e.g. Flat 402, Green Meadows", colSpan: "md:col-span-2" },
    city: { label: "City", placeholder: "e.g. New Delhi", colSpan: "md:col-span-1" },
    state: { label: "State", placeholder: "e.g. Delhi", colSpan: "md:col-span-1" },
    pincode: { label: "Pincode", placeholder: "e.g. 110001", colSpan: "md:col-span-1" },
  }

  const [position, setPosition] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState("")
  const [payment] = useState<"cod" | "online">("cod")
  const fetchingRef = useRef(false)

  const [address, setAddress] = useState({
    fullName: userData?.name || "",
    mobile: userData?.mobile || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation || fetchingRef.current) return

    setError("")
    fetchingRef.current = true
    setGpsLoading(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords

        if (isValidLatLng(latitude, longitude)) {
          setPosition([latitude, longitude])
        }

        setGpsLoading(false)
        fetchingRef.current = false
      },
      () => {
        setError("Could not access your current location.")
        setGpsLoading(false)
        fetchingRef.current = false
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  useEffect(fetchCurrentLocation, [])

  useEffect(() => {
    if (!position || !isValidLatLng(position[0], position[1])) return

    axios
      .get("/api/reverse-geocode", {
        params: { lat: position[0], lon: position[1] },
      })
      .then((res) => {
        const a = res.data.address || {}
        setAddress((p) => ({
          ...p,
          address: res.data.display_name || "",
          city: a.city || a.town || "",
          state: a.state || "",
          pincode: a.postcode || "",
        }))
      })
      .catch(() => {})
  }, [position])

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return

    setError("")
    setSearchLoading(true)
    try {
      const res = await axios.get("/api/search-location", {
        params: { q: searchQuery },
      })

      if (res.data?.length) {
        const lat = +res.data[0].lat
        const lon = +res.data[0].lon
        if (isValidLatLng(lat, lon)) {
          setPosition([lat, lon])
        }
      } else {
        setError("No matching location found. Try a nearby landmark or area.")
      }
    } catch {
      setError("Could not search that location right now.")
    } finally {
      setSearchLoading(false)
    }
  }

  const subtotal = cartData.reduce((s, i) => s + i.price * i.quantity, 0)

  const handlePlaceOrder = async () => {
    setError("")
    if (!position) {
      setError("Choose a delivery location before placing the order.")
      return
    }
    if (cartData.length === 0 || payment !== "cod") return

    setPlacingOrder(true)
    try {
      await axios.post("/api/user/order", {
        userId: userData?._id,
        items: cartData.map((i) => ({
          grocery: i._id,
          name: i.name,
          price: String(i.price),
          unit: String(i.unit),
          image: i.image,
          quantity: i.quantity,
        })),
        paymentMethod: "cod",
        totalAmount: subtotal,
        address: {
          ...address,
          latitude: position[0],
          longitude: position[1],
        },
      })

      router.push("/user/order-success")
    } catch {
      setError("Could not place the order. Please check the details and try again.")
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 bg-white/60 backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Cart
        </button>

        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Almost there
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
              Checkout
            </h1>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white border border-gray-150 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            <ShoppingBag size={16} className="text-emerald-600" />
            {cartData.length} {cartData.length === 1 ? "item" : "items"}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
          <div className="rounded-3xl border border-gray-150 bg-white p-5 shadow-xs sm:p-8 space-y-6">
            <div className="flex gap-2 items-center font-bold text-green-700 border-b pb-3 border-zinc-100">
              <MapPin size={20} /> 
              <span>Delivery Address</span>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {Object.entries(address).map(([k, v]) => {
                const meta = fieldMeta[k] || { label: k, placeholder: k, colSpan: "" }
                return (
                  <div key={k} className={`flex flex-col space-y-1.5 ${meta.colSpan}`}>
                    <label className="text-xs font-semibold text-gray-500 select-none">
                      {meta.label}
                    </label>
                    <input
                      value={v}
                      placeholder={meta.placeholder}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, [k]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder="Search city or area..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-gray-50/50 focus:bg-white"
              />
              <button
                onClick={handleSearchLocation}
                disabled={searchLoading}
                className="grid h-12 w-12 place-items-center rounded-xl bg-green-600 hover:bg-green-700 text-white transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer shadow-sm hover:shadow"
                aria-label="Search location"
              >
                {searchLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>

            <div className="relative mt-4 h-64 overflow-hidden rounded-xl border bg-green-50 sm:h-80 shadow-inner">
              {position && (
                <CheckoutMap position={position} setPosition={setPosition} />
              )}

              {!position && (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-gray-500">
                  Search for your area or use current location to pin the delivery spot.
                </div>
              )}

              <button
                onClick={fetchCurrentLocation}
                disabled={gpsLoading}
                className="absolute bottom-4 right-4 z-[1000] grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 disabled:opacity-70 cursor-pointer"
                aria-label="Use current location"
              >
                {gpsLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <LocateFixed size={20} />
                )}
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 border border-red-250 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-xs lg:sticky lg:top-24 space-y-6">
            <div className="flex gap-2 items-center font-bold text-green-700 border-b pb-3 border-zinc-100">
              <CreditCard size={20} /> 
              <span>Payment Method</span>
            </div>

            <button className="w-full rounded-xl border border-green-200 bg-green-50/70 py-4 font-semibold text-green-800 shadow-xs select-none">
              Cash on Delivery
            </button>

            <div className="flex justify-between border-t border-zinc-150 pt-4 font-semibold text-zinc-800">
              <span>Total</span>
              <span className="text-green-750 font-bold text-lg">₹{subtotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || cartData.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              {placingOrder && <Loader2 size={18} className="animate-spin" />}
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
