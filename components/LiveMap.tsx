"use client"

import L from "leaflet"
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

type Location = {
  latitude?: number
  longitude?: number
}

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (
      map &&
      Array.isArray(position) &&
      typeof position[0] === "number" &&
      typeof position[1] === "number"
    ) {
      map.setView(position, map.getZoom(), { animate: true })
    }
  }, [position, map])

  return null
}

export default function LiveMap({
  userLocation,
  deliveryBoyLocation,
}: {
  userLocation: Location
  deliveryBoyLocation?: Location
}) {
  const hasUserCoords =
    typeof userLocation?.latitude === "number" &&
    typeof userLocation?.longitude === "number" &&
    userLocation.latitude !== 0 &&
    userLocation.longitude !== 0

  const hasDeliveryCoords =
    typeof deliveryBoyLocation?.latitude === "number" &&
    typeof deliveryBoyLocation?.longitude === "number" &&
    deliveryBoyLocation.latitude !== 0 &&
    deliveryBoyLocation.longitude !== 0

  if (!hasUserCoords) {
    return null
  }

  const userPos: [number, number] = [
    userLocation.latitude!,
    userLocation.longitude!,
  ]

  const deliveryPos: [number, number] | null = hasDeliveryCoords
    ? [deliveryBoyLocation!.latitude!, deliveryBoyLocation!.longitude!]
    : null

  const mapKey = `${userPos[0]}-${userPos[1]}`

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })

  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/1023/1023448.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl border bg-white">
      <MapContainer
        key={mapKey}
        center={userPos}
        zoom={15}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={userPos} icon={userIcon}>
          <Popup>User Location</Popup>
        </Marker>

        {deliveryPos && (
          <>
            <Marker position={deliveryPos} icon={deliveryBoyIcon}>
              <Popup>Delivery Boy Location</Popup>
            </Marker>

            <Polyline
              positions={[userPos, deliveryPos]}
              color="green"
              weight={3}
            />

            <Recenter position={deliveryPos} />
          </>
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow text-sm font-medium">
        📍 Live Delivery Tracking
      </div>
    </div>
  )
}
