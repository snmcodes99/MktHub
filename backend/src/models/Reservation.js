const mongoose = require("mongoose")

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            sellingPrice: {
                type: Number,
                required: true,
                min: [0, "Selling price cannot be negative"]
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"]
            }
        }
    ],
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        houseNo: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    source: {
        type: String,
        enum: ["CART", "BUY_NOW"],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, "Total amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "EXPIRED", "CANCELLED", "PROCESSING"],
        default: "PENDING"
    },
    expiresAt: {
        type: Date,
        required: true
    },
    cleanupAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true
})
reservationSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret
    }
})

module.exports = mongoose.model("Reservation", reservationSchema)