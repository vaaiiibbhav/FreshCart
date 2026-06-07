import mongoose from "mongoose"

export interface IChatRoom {
  _id?: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  deliveryBoyId: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const chatRoomSchema = new mongoose.Schema<IChatRoom>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

const ChatRoom =
  mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema)

export default ChatRoom
