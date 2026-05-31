"use client"

import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Search,
  Loader2,
  LocateFixed,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState, useRef } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import axios from "axios"

/* ================= ICON ================= */
const markerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [28, 45],
  iconAnchor: [14, 45],
})

/* ================= HELPERS (FIX) ================= */
const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0)

/* ================= RECENTER MAP ================= */
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])

  return null
}

/* ================= DRAGGABLE MARKER ================= */
function DraggableMarker({
  position,
  setPosition,
}: {
  position: [number, number]
  setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>
}) {
  return (
    <Marker
      icon={markerIcon}
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target as L.Marker
          const { lat, lng } = marker.getLatLng()

          if (isValidLatLng(lat, lng)) {
            setPosition([lat, lng])
          }
        },
      }}
    >
      <Popup>Delivery Location</Popup>
    </Marker>
  )
}

/* ================= PAGE ================= */
export default function CheckoutPage() {
  const router = useRouter()
  const { userData } = useSelector((s: RootState) => s.user)
  const { cartData } = useSelector((s: RootState) => s.cart)

  const [position, setPosition] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
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

  /* ================= CURRENT LOCATION (FIXED) ================= */
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation || fetchingRef.current) return

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
        setGpsLoading(false)
        fetchingRef.current = false
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  useEffect(fetchCurrentLocation, [])

  /* ================= REVERSE GEOCODE (FIXED) ================= */
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

  /* ================= SEARCH ================= */
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return

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
      }
    } finally {
      setSearchLoading(false)
    }
  }

  /* ================= ORDER ================= */
  const subtotal = cartData.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  )

  const handlePlaceOrder = async () => {
    if (!position || payment !== "cod") return
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
    } finally {
      setPlacingOrder(false)
    }
  }

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-green-700 mb-4"
        >
          <ArrowLeft size={18} /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ADDRESS */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <div className="flex gap-2 font-semibold text-green-700">
              <MapPin /> Delivery Address
            </div>

            {Object.entries(address).map(([k, v]) => (
              <input
                key={k}
                value={v}
                placeholder={k}
                onChange={(e) =>
                  setAddress((p) => ({ ...p, [k]: e.target.value }))
                }
                className="w-full px-4 py-3 border rounded-xl"
              />
            ))}

            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder="Search city or area..."
                className="flex-1 px-4 py-3 border rounded-xl"
              />
              <button
                onClick={handleSearchLocation}
                className="w-12 bg-green-600 text-white rounded-xl"
              >
                {searchLoading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <Search className="mx-auto" />
                )}
              </button>
            </div>

            <div className="relative h-56 rounded-xl overflow-hidden border">
              {position && (
                <MapContainer
                  center={position}
                  zoom={15}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <RecenterMap position={position} />
                  <DraggableMarker
                    position={position}
                    setPosition={setPosition}
                  />
                </MapContainer>
              )}

              <button
                onClick={fetchCurrentLocation}
                className="absolute bottom-4 right-4 w-12 h-12 bg-green-600 text-white rounded-full z-[1000]"
              >
                {gpsLoading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <LocateFixed className="mx-auto" />
                )}
              </button>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div className="font-semibold text-green-700 flex gap-2">
              <CreditCard /> Payment Method
            </div>

            <button className="w-full py-4 border rounded-xl bg-green-50 font-semibold">
              Cash on Delivery
            </button>

            <div className="flex justify-between font-semibold pt-4 border-t">
              <span>Total</span>
              <span className="text-green-700">₹{subtotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full py-3 rounded-full bg-green-600 text-white"
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
