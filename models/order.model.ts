import mongoose from "mongoose";

export interface IOrder {
  _id ?: mongoose.Types.ObjectId,
  user : mongoose.Types.ObjectId,
  assignment ?: mongoose.Types.ObjectId,
  items: [
    {
      grocery : mongoose.Types.ObjectId,
      name    : string,
      price   : string,
      unit    : string,
      image   : string, 
      quantity: number,
    }
  ],
  assignedDeliveryBoy ?: mongoose.Types.ObjectId | null,
  totalAmount         : number,
  paymentMethod       : "cod" | "online",
  isPaid              : boolean,
  address             : {
    fullName          : string,
    mobile            : string,
    fullAddress       : string,
    city              : string,
    state             : string,
    pincode           : string,
    latitude          : number,
    longitude         : number,
  },
  status            : "pending" | "out of delivery" | "delivered",
  createdAt         ?: Date,
  updatedAt         ?: Date,
}

const OrderSchema = new mongoose.Schema<IOrder>({
  user : {
    type     : mongoose.Schema.Types.ObjectId,
    ref      : "User",
    required : true
  },
  assignment : { 
    type     : mongoose.Schema.Types.ObjectId,
    ref      : "DeliveryAssignmentModel",
    default  : null
  },
  items : [
    {
      grocery : {
        type     : mongoose.Schema.Types.ObjectId,
        ref      : "User",
        required : true
      },
      name    : String,
      price   : String,
      unit    : String,
      image   : String,
      quantity: Number,
    }
  ],
  assignedDeliveryBoy : {
    type     : mongoose.Schema.Types.ObjectId,
    ref      : "User",
    default  : null
  },
  isPaid        : {
    type     : Boolean,
    default  : false,
    required : true
  },
  paymentMethod : {
    type     : String,
    enum     : ["cod", "online"],
    default  : "cod",
    required : true
  },
  totalAmount :  Number,
  address       : {
    fullName    : String,
    mobile      : String,
    fullAddress : String,
    city        : String,
    state       : String,
    pincode     : String,
    latitude    : Number,
    longitude   : Number,
  },
  status : {
    type     : String,
    enum     : ["pending", "out of delivery", "delivered"],
    default  : "pending",
    required : true
  },
}, {
  timestamps : true,
})

const OrderModel = mongoose.models.OrderModel || mongoose.model("OrderModel", OrderSchema)

export default OrderModel