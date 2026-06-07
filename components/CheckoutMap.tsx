"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import { useEffect } from "react"

const markerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [28, 45],
  iconAnchor: [14, 45],
})

const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0)

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])

  return null
}

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

export default function CheckoutMap({
  position,
  setPosition,
}: {
  position: [number, number]
  setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>
}) {
  return (
    <MapContainer center={position} zoom={15} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RecenterMap position={position} />
      <DraggableMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}
