import mongoose from "mongoose";

export interface IMessage {
  _id        : mongoose.Types.ObjectId;
  roomId     : mongoose.Types.ObjectId;
  senderId   : mongoose.Types.ObjectId;
  text       : string;
  time       : string;
  createdAt ?: Date;
  updatedAt ?: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  roomId    : { type : mongoose.Schema.Types.ObjectId, ref : "Order" },
  senderId  : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
  text      : String,
  time      : String,
},{ timestamps : true })

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)

export default Message