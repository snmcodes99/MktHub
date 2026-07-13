const mongoose = require("mongoose")
const OrderModel = require("../models/Order")
const PaymentModel = require("../models/Payment")
const razorpay = require("../config/razorpay")
const { restoreStock } = require("./inventoryService")
const ApiError = require("../utils/ApiErrors")

const initiateRefund = async (order, payment, reason = "Order cancelled") => {
    const claimingOrder = await OrderModel.findOneAndUpdate(
        {
            _id: order._id,
            refundStatus: "PENDING"
        },
        {
            $set: { refundStatus: "PROCESSING" }
        },
        { returnDocument: "after" }
    )

    if (!claimingOrder) {
        return 
    }

    try {
        const refundResponse = await razorpay.payments.refund(payment.gatewayPaymentId, {
            amount: Math.round(payment.amount * 100),
            receipt: order._id.toString()
        })

        await OrderModel.updateOne(
            { _id: claimingOrder._id },
            {
                $set: {
                    gatewayRefundId: refundResponse.id
                }
            }
        )
        return claimingOrder
    } catch (error) {
        console.error("Razorpay refund init error", error)
        
        if (error.statusCode >= 400 && error.statusCode < 500) {
             await OrderModel.updateOne(
                { _id: claimingOrder._id },
                {
                    $set: {
                        refundStatus: "FAILED",
                        refundFailureReason: error.error?.description || error.message
                    }
                }
            )
        }
    }
}

const initiateLateCaptureRefund = async (order, paymentEntity) => {
    const claimingOrder = await OrderModel.findOneAndUpdate(
        {
            _id: order._id,
            orderStatus: "CANCELLED",
            refundStatus: { $in: ["NONE", "FAILED"] }
        },
        {
            $set: { 
                refundStatus: "PROCESSING", 
                refundAmount: paymentEntity.amount / 100 
            }
        },
        { returnDocument: "after" }
    )

    if (!claimingOrder) return

    try {
        const refundResponse = await razorpay.payments.refund(paymentEntity.id, {
            amount: paymentEntity.amount,
            notes: { isLateCapture: "true" }
        })

        await OrderModel.updateOne(
            { _id: claimingOrder._id },
            {
                $set: {
                    gatewayRefundId: refundResponse.id
                }
            }
        )
    } catch (error) {
         if (error.statusCode >= 400 && error.statusCode < 500) {
             await OrderModel.updateOne(
                { _id: claimingOrder._id },
                {
                    $set: {
                        refundStatus: "FAILED",
                        refundFailureReason: error.error?.description || error.message
                    }
                }
            )
        }
    }
}

const processSuccessfulRefund = async (refundEntity) => {
    if (refundEntity.status !== "processed") {
        throw new ApiError(400, "Refund is not processed")
    }

    const isLateCapture = refundEntity.notes && refundEntity.notes.isLateCapture === "true";
    const gatewayRefundId = refundEntity.id;

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        let order = await OrderModel.findOne({ gatewayRefundId })
        if (!order) {
            const payment = await PaymentModel.findOne({ gatewayPaymentId: refundEntity.payment_id })
            if (payment && payment.order) {
                order = await OrderModel.findById(payment.order)
            }
        }

        if (!order) return { skipped: true, reason: "Order not found" }
        if (order.refundStatus === "COMPLETED") return { alreadyProcessed: true }

        const claimedOrder = await OrderModel.findOneAndUpdate(
            {
                _id: order._id,
                refundStatus: { $ne: "COMPLETED" }
            },
            {
                $set: {
                    refundStatus: "COMPLETED",
                    paymentStatus: "REFUNDED",
                    orderStatus: "CANCELLED",
                    refundedAt: new Date(),
                    gatewayRefundId: gatewayRefundId
                }
            },
            { session, returnDocument: "after" }
        )

        if (!claimedOrder) {
            await session.abortTransaction()
            return { alreadyProcessed: true }
        }

        if (!isLateCapture && order.orderStatus === "CANCELLING") {
            await restoreStock(claimedOrder.items, session)
        }

        await session.commitTransaction()
        return { recovered: true }
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        await session.endSession()
    }
}

const reconcileRefund = async (order) => {
    if (order.gatewayRefundId) {
        try {
            const refund = await razorpay.refunds.fetch(order.gatewayRefundId)
            if (refund.status === "processed") {
                 await processSuccessfulRefund(refund)
                 return { recovered: true }
            }
            return { state: refund.status }
        } catch (error) {
             return { state: "ERROR" }
        }
    } else {
        const payment = await PaymentModel.findOne({ order: order._id }).sort({ createdAt: -1 })
        if (payment && payment.gatewayPaymentId) {
             try {
                 const refunds = await razorpay.payments.fetchRefunds(payment.gatewayPaymentId)
                 const processed = refunds.items?.find(r => r.status === "processed")
                 if (processed) {
                     await processSuccessfulRefund(processed)
                     return { recovered: true }
                 }
                 const anyRefund = refunds.items?.[0]
                 return { state: anyRefund ? anyRefund.status : "NOT_FOUND" }
             } catch (error) {
                 return { state: "ERROR" }
             }
        }
        return { state: "NOT_FOUND" }
    }
}

module.exports = {
    initiateRefund,
    initiateLateCaptureRefund,
    processSuccessfulRefund,
    reconcileRefund
}
