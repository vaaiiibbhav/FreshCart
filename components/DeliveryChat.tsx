"use client"

import { getSocket } from "@/app/lib/socket"
import { IMessage } from "@/models/message.model"
import axios from "axios"
import { Sparkles } from "lucide-react"
import mongoose from "mongoose"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

type Props = {
  orderId: mongoose.Types.ObjectId
  deliveryBoyId?: mongoose.Types.ObjectId
}

type UIMessage = IMessage & {
  _clientId: string
}

export default function DeliveryChat({ orderId, deliveryBoyId }: Props) {
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([
    "I’m on the way 🚴‍♂️",
    "Reached nearby",
    "Will arrive in 5 minutes",
    "Please be ready",
  ])
  const [loadingAI, setLoadingAI] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // ✅ SAFE STRING ID (CORE FIX)
  const myId = deliveryBoyId ? String(deliveryBoyId) : null

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* SOCKET: JOIN ROOM + RECEIVE MESSAGE */
  useEffect(() => {
    const socket = getSocket()
    const roomId = orderId.toString()

    socket.emit("join-room", roomId)

    socket.on("send-message", (message: IMessage) => {
      if (message?.roomId?.toString() !== roomId) return

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

  /* SEND MESSAGE */
  const sendMsg = () => {
    if (!newMessage.trim() || !myId) return

    const socket = getSocket()

    const message: UIMessage = {
      _clientId: uuidv4(),
      roomId: orderId,
      text: newMessage,
      senderId: deliveryBoyId!,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, message])
    socket.emit("send-message", message)
    setNewMessage("")
  }

  /* FETCH CHAT HISTORY */
  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const res = await axios.post("/api/chat/messages", {
          roomId: orderId,
        })

        const normalized: UIMessage[] = Array.isArray(res.data)
          ? res.data.map((m: IMessage) => ({
              ...m,
              _clientId: m._id?.toString() ?? uuidv4(),
            }))
          : []

        setMessages(normalized)
      } catch (error) {
        console.error(error)
      }
    }

    getAllMessages()
  }, [orderId])

  /* AI SUGGESTIONS */
  const getAISuggestions = async () => {
    if (!myId) return

    const lastMessage = messages
      .filter((m) => m.senderId && String(m.senderId) === myId)
      .at(-1)

    if (!lastMessage) return

    try {
      setLoadingAI(true)

      const res = await axios.post("/api/chat/ai-suggestions", {
        text: lastMessage.text,
        role: "deliveryBoy",
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
    <div className="flex flex-col h-[480px]
                    bg-white/80 backdrop-blur-xl
                    rounded-3xl shadow-2xl border overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3
                      bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <span className="text-sm font-semibold">
          Chat with Customer
        </span>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={getAISuggestions}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium
                     bg-white/20 backdrop-blur rounded-full border border-white/30"
        >
          <Sparkles size={14} />
          {loadingAI ? "Thinking…" : "AI Suggests"}
        </motion.button>
      </div>

      {/* AI QUICK REPLIES */}
      {suggestions.length > 0 && (
        <div className="px-4 py-3 border-b bg-white">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNewMessage(s)}
                className="whitespace-nowrap px-4 py-1.5 text-xs
                           bg-gradient-to-r from-purple-100 to-indigo-100
                           text-purple-700 rounded-full
                           border border-purple-200 shadow-sm"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#f6f7f9]">
        <AnimatePresence>
          {messages.map((message) => {
            const isMe =
              myId && message.senderId
                ? String(message.senderId) === myId
                : false

            return (
              <motion.div
                key={message._id?.toString() ?? message._clientId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 max-w-[75%] rounded-2xl text-sm shadow
                    ${
                      isMe
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                >
                  <p>{message.text}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">
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
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-t">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Type a message to the customer…"
          className="flex-1 px-4 py-2 rounded-full bg-gray-100
                     focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={sendMsg}
          className="px-5 py-2 rounded-full
                     bg-gradient-to-r from-emerald-500 to-teal-500
                     text-white font-medium shadow-lg
                     hover:scale-[1.03] transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
