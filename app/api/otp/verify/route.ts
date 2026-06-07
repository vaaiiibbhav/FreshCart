import connectDB from "@/app/lib/db"
import DeliveryAssignmentModel from "@/models/deliveryAssignment.model"
import OrderModel from "@/models/order.model"
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { sendMail } from "@/app/lib/mailer"

export async function POST(req: NextRequest) {
  await connectDB()
  
  let session: mongoose.mongo.ClientSession | undefined
  try {
    session = await mongoose.startSession()
    session.startTransaction()
  } catch (sessErr) {
    console.warn("MongoDB replica set sessions not supported, running non-transactional updates:", sessErr)
  }

  const sessionOpts = session ? { session } : undefined

  try {
    const { orderId, otp } = await req.json()
    if (!orderId || !otp) {
      if (session) {
        await session.abortTransaction()
        session.endSession()
      }
      return NextResponse.json(
        { message: "Order ID and OTP are required" },
        { status: 400 }
      )
    }

    const order = await OrderModel.findById(orderId).session(session || null)
    if (!order) {
      if (session) {
        await session.abortTransaction()
        session.endSession()
      }
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      )
    }

    if (order.deliveryOtp !== otp) {
      if (session) {
        await session.abortTransaction()
        session.endSession()
      }
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      )
    }

    order.status = "delivered"
    order.deliveryOtpVerification = true
    order.deliveredAt = new Date()
    await order.save(sessionOpts)

    await DeliveryAssignmentModel.updateOne(
      { order: orderId },
      { $set: { status: "completed" } },
      sessionOpts
    )

    if (session) {
      await session.commitTransaction()
      session.endSession()
    }

    // Now send the itemized receipt HTML to the populated user email address (post-transaction)
    try {
      const populatedOrder = await OrderModel.findById(orderId).populate<{ user: { name: string; email: string } }>("user")
      if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
        const customerEmail = populatedOrder.user.email
        const customerName = populatedOrder.user.name || "Valued Customer"

        interface ReceiptItemType {
          name: string
          unit: string
          quantity: number
          price: string
        }

        const itemsHtml = populatedOrder.items.map((item: ReceiptItemType) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.unit})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join("")

        const receiptHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
              <h2 style="color: #064e3b; margin: 0; font-size: 24px;">Urban Grocer</h2>
              <p style="color: #059669; font-size: 14px; margin: 4px 0 0 0;">Order Delivered Successfully</p>
            </div>
            <p style="color: #374151; font-size: 16px;">Hi ${customerName},</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Your order <strong>#${populatedOrder._id!.toString().slice(-6)}</strong> has been successfully delivered! Below is your itemized receipt.</p>
            
            <h3 style="color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px; font-size: 16px;">Order Receipt</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
              <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                  <th style="padding: 10px; color: #374151;">Item</th>
                  <th style="padding: 10px; text-align: center; color: #374151;">Qty</th>
                  <th style="padding: 10px; text-align: right; color: #374151;">Price</th>
                  <th style="padding: 10px; text-align: right; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <table style="width: 100%; margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; font-size: 14px; color: #4b5563; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #4b5563;">Payment Method:</td>
                <td style="text-align: right; font-weight: bold; color: #111827; padding: 6px 0;">${populatedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0 4px 0; border-top: 1px solid #e5e7eb; font-size: 16px; font-weight: bold; color: #111827;">Amount Paid:</td>
                <td style="padding: 10px 0 4px 0; border-top: 1px solid #e5e7eb; text-align: right; font-size: 16px; font-weight: bold; color: #059669;">₹${populatedOrder.totalAmount}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              <p>Thank you for shopping with Urban Grocer! We hope to see you again soon.</p>
            </div>
          </div>
        `

        await sendMail({
          to: customerEmail,
          subject: `Your Urban Grocer Receipt - Order #${populatedOrder._id!.toString().slice(-6)}`,
          html: receiptHtml,
        })
      }
    } catch (mailErr: unknown) {
      console.error("Nodemailer receipt sequence failed:", mailErr instanceof Error ? mailErr.message : mailErr)
    }

    return NextResponse.json(
      { message: "OTP verified successfully and receipt emailed" },
      { status: 200 }
    )
  } catch (err: unknown) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    console.error("OTP Verification Error:", err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}