const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
            index: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, "Payment amount cannot be negative"]
        },
        currency: {
            type: String,
            default: "INR"
        },
        provider: {
            type: String,
            enum: ["RAZORPAY"],
            default: "RAZORPAY"
        },
        gatewayOrderId: {
            type: String,
            unique: true,
            sparse: true
        },
        gatewayPaymentId: {
            type: String,
            unique: true,
            sparse: true
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "SUCCESS",
                "FAILED",
                "PROCESSING",
                "EXPIRED",
                "CANCELLED"
            ],
            default: "PENDING"
        },
        failureReason: {
            type: String,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        },
        receipt: {
            type: String
        }
    },
    {
        timestamps: true
    }
)
paymentSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v
        return ret
    }
})
module.exports = mongoose.model("Payment", paymentSchema)