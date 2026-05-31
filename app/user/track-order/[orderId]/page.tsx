"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { ArrowLeft, Sparkles } from "lucide-react"
import LiveMap from "@/components/LiveMap"
import { getSocket } from "@/app/lib/socket"
import { IUser } from "@/models/user.model"
import { AnimatePresence, motion } from "motion/react"
import { IMessage } from "@/models/message.model"
import { v4 as uuidv4 } from "uuid"

interface IOrder {
  _id?: any
  user: any
  items: any[]
  assignedDeliveryBoy?: IUser
  address: {
    latitude: number
    longitude: number
  }
  status: string
}

interface ILocation {
  latitude: number
  longitude: number
}

type UIMessage = IMessage & {
  _clientId: string
}

export default function TrackOrderPage() {
  const router = useRouter()
  const { orderId } = useParams()
  const { userData } = useSelector((state: RootState) => state.user)

  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [order, setOrder] = useState<IOrder | null>(null)

  const [suggestions, setSuggestions] = useState<string[]>([
    "Where are you right now?",
    "How long will it take?",
    "Please call when you arrive",
    "I’m at the gate",
    "Is there any delay?",
  ])
  const [loadingAI, setLoadingAI] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  })

  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  })

  // 🔹 AUTO SCROLL (UNCHANGED)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 🔹 FETCH ORDER (UNCHANGED)
  useEffect(() => {
    if (!orderId) return

    axios.get(`/api/user/get-order/${orderId}`).then((res) => {
      setOrder(res.data)
      setUserLocation(res.data.address)

      const coords = res.data.assignedDeliveryBoy?.location?.coordinates
      if (coords?.length === 2) {
        setDeliveryBoyLocation({
          latitude: coords[1],
          longitude: coords[0],
        })
      }
    })
  }, [orderId])

  // 🔹 SOCKET: JOIN ROOM + RECEIVE MESSAGE (DO NOT TOUCH)
  useEffect(() => {
    if (!orderId) return
    const socket = getSocket()

    socket.emit("join-room", orderId)

    socket.on("send-message", (message: IMessage) => {
      if (message.roomId.toString() !== orderId.toString()) return

      setMessages((prev) => [
        ...prev,
        {
          ...message,
          _clientId: message._id?.toString() ?? uuidv4(),
        },
      ])
    })

    return () => {
      socket.off("send-message")
    }
  }, [orderId])

  // 🔹 LIVE LOCATION UPDATES (UNCHANGED)
  useEffect(() => {
    const socket = getSocket()

    socket.on("update-deliveryBoy-location", (data) => {
      if (data?.location?.coordinates?.length === 2) {
        setDeliveryBoyLocation({
          latitude: data.location.coordinates[1],
          longitude: data.location.coordinates[0],
        })
      }
    })

    return () => {
      socket.off("update-deliveryBoy-location")
    }
  }, [])

  // 🔹 SEND MESSAGE (UNCHANGED)
  const sendMsg = () => {
    if (!newMessage.trim()) return

    const socket = getSocket()
    socket.emit("send-message", {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })

    setNewMessage("")
  }

  // 🔹 FETCH CHAT HISTORY (SAFE)
  useEffect(() => {
    if (!orderId) return

    axios.post("/api/chat/messages", { roomId: orderId }).then((res) => {
      const normalized: UIMessage[] = Array.isArray(res.data)
        ? res.data.map((m: IMessage) => ({
            ...m,
            _clientId: m._id?.toString() ?? uuidv4(),
          }))
        : []

      setMessages(normalized)
    })
  }, [orderId])

  // 🔹 AI SUGGESTIONS (USER POV, REST ONLY)
  const getAISuggestions = async () => {
    const lastMessage = messages.filter((m) => m.senderId.toString() === userData?._id.toString()).at(-1)
    if (!lastMessage) return

    try {
      setLoadingAI(true)

      const res = await axios.post("/api/chat/ai-suggestions", {
        text: lastMessage.text,
        role: "user",
      })

      if (Array.isArray(res.data?.suggestions)) {
        setSuggestions(res.data.suggestions)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Track Your Order</h1>
          <p className="text-xs text-gray-500">Order #{orderId}</p>
        </div>
      </div>

      {/* MAP */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <LiveMap
          userLocation={userLocation}
          deliveryBoyLocation={deliveryBoyLocation}
        />
      </div>

      {/* CHAT CARD */}
      <div className="flex flex-col h-[520px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden">
        {/* CHAT HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div>
            <p className="text-sm font-semibold">Chat with Delivery Partner</p>
            <p className="text-xs opacity-90">{order?.status}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={getAISuggestions}
            className="flex items-center gap-2 px-4 py-1.5 text-xs bg-white/20 rounded-full border border-white/30"
          >
            <Sparkles size={14} />
            {loadingAI ? "Thinking…" : "AI Assist"}
          </motion.button>
        </div>

        {/* AI QUICK REPLIES */}
        {suggestions.length > 0 && (
          <div className="px-4 py-3 bg-white border-b">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewMessage(s)}
                  className="whitespace-nowrap px-4 py-1.5 text-xs
                             bg-gradient-to-r from-purple-100 to-indigo-100
                             text-purple-700 rounded-full border border-purple-200 shadow-sm"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f6f7f9]">
          <AnimatePresence>
            {messages.map((message) => {
              const isMe =
                message.senderId?.toString() === userData?._id?.toString()

              return (
                <motion.div
                  key={message._id?.toString() ?? message._clientId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow
                      ${
                        isMe
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-[10px] mt-1 text-right opacity-70">
                      {message.time}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Type a message…"
            className="flex-1 px-5 py-2.5 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={sendMsg}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-[1.03] transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
