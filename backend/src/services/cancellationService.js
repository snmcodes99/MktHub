const mongoose = require("mongoose")
const OrderModel = require("../models/Order")
const PaymentModel = require("../models/Payment")
const ReservationModel = require("../models/Reservation")
const ApiError = require("../utils/ApiErrors")
const { restoreStock, releaseReserveInventory } = require("./inventoryService")
const { reconcilePayment, processSuccessfulPayment } = require("./paymentService")

const cancelCodOrder = async (order, reason) => {
    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const claimingOrder = await OrderModel.findOneAndUpdate(
            {
                _id: order._id,
                paymentMethod: "COD",
                orderStatus: { $in: ["PLACED", "PROCESSING"] }
            },
            {
                $set: { 
                    orderStatus: "CANCELLING",
                    cancelReason: reason
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!claimingOrder) {
            throw new ApiError(409, "Order status changed, cannot cancel COD order.")
        }

        await restoreStock(claimingOrder.items, session)

        const cancelledOrder = await OrderModel.findOneAndUpdate(
            {
                _id: claimingOrder._id,
                orderStatus: "CANCELLING"
            },
            {
                $set: {
                    orderStatus: "CANCELLED",
                    cancelledAt: new Date()
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!cancelledOrder) {
             throw new ApiError(409, "Order status changed during cancellation.")
        }

        await session.commitTransaction()
        return cancelledOrder

    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        await session.endSession()
    }
}

const cancelPendingOnlineOrder = async (order, reason) => {
    const payment = await PaymentModel.findOne({ order: order._id }).sort({ createdAt: -1 })
    
    if (!payment) {
        throw new ApiError(404, "Payment record not found for this order")
    }

    if (payment.status === "PROCESSING" || payment.status === "SUCCESS") {
        throw new ApiError(400, "Payment is already processing or successful, cannot do unpaid cancellation")
    }

    if (payment.status !== "PENDING") {
        throw new ApiError(400, "Payment is no longer pending")
    }

    const reconciliation = await reconcilePayment(payment)

    if (reconciliation.state === "CAPTURED") {
        await processSuccessfulPayment(reconciliation.paymentEntity)
        throw new ApiError(400, "Payment was actually captured. Order is now paid. To cancel, please request a paid cancellation.")
    }

    if (reconciliation.state !== "NOT_PAID") {
        throw new ApiError(400, `Payment state is ambiguous or authorized (${reconciliation.state}). Cannot cancel safely.`)
    }

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        // 1. Claim Payment
        const claimedPayment = await PaymentModel.findOneAndUpdate(
            {
                _id: payment._id,
                status: "PENDING"
            },
            {
                $set: { status: "CANCELLED" }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!claimedPayment) {
             throw new ApiError(409, "Payment status changed during cancellation. Please retry.")
        }

        // 2. Claim Reservation
        const claimedReservation = await ReservationModel.findOneAndUpdate(
            {
                _id: claimedPayment.reservation,
                status: "PENDING"
            },
            {
                $set: { status: "PROCESSING" }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!claimedReservation) {
            throw new ApiError(409, "Reservation status changed during cancellation.")
        }

        // 3. Claim Order
        const claimedOrder = await OrderModel.findOneAndUpdate(
            {
                _id: order._id,
                paymentMethod: "ONLINE",
                paymentStatus: "PENDING",
                orderStatus: "PENDING"
            },
            {
                $set: { 
                    orderStatus: "CANCELLING",
                    cancelReason: reason 
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!claimedOrder) {
            throw new ApiError(409, "Order status changed during cancellation.")
        }

        // 4. Release Reserved Inventory
        await releaseReserveInventory(claimedReservation.items, session)

        // 5. Finalize states
        const cancelledReservation = await ReservationModel.findOneAndUpdate(
            {
                _id: claimedReservation._id,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "CANCELLED",
                    cleanupAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            {
                returnDocument: "after",
                session 
            }
        )

        if (!cancelledReservation) {
            throw new ApiError(409, "Reservation state changed during finalization")
        }

        const cancelledOrder = await OrderModel.findOneAndUpdate(
            {
                _id: claimedOrder._id,
                orderStatus: "CANCELLING"
            },
            {
                $set: {
                    orderStatus: "CANCELLED",
                    cancelledAt: new Date()
                }
            },
            { 
                returnDocument: "after", 
                session 
            }
        )

        if (!cancelledOrder) {
            throw new ApiError(409, "Order state changed during finalization")
        }

        await session.commitTransaction()
        return cancelledOrder

    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        await session.endSession()
    }
}

const cancelPaidOnlineOrder = async (order, reason) => {
    // Atomically claim Order to prevent double cancellations
    const claimedOrder = await OrderModel.findOneAndUpdate(
        {
            _id: order._id,
            paymentMethod: "ONLINE",
            paymentStatus: "PAID",
            orderStatus: { $in: ["PLACED", "PROCESSING"] }
        },
        {
            $set: {
                orderStatus: "CANCELLING",
                refundStatus: "PENDING",
                cancelReason: reason,
                refundAmount: order.totalPrice
            }
        },
        {
            returnDocument: "after"
        }
    )

    if (!claimedOrder) {
        throw new ApiError(409, "Order cannot be cancelled. It may already be cancelled, refunded, or shipped.")
    }

    const payment = await PaymentModel.findOne({ order: order._id, status: "SUCCESS" }).sort({ createdAt: -1 })

    if (!payment) {
        // Rollback state if we can't find successful payment
        await OrderModel.findByIdAndUpdate(claimedOrder._id, {
            $set: {
                orderStatus: order.orderStatus,
                refundStatus: order.refundStatus,
                cancelReason: order.cancelReason
            }
        })
        throw new ApiError(404, "Successful payment record not found for refund")
    }

    const { initiateRefund } = require("./refundService")
    await initiateRefund(claimedOrder, payment, reason)

    // The order is now left in CANCELLING / PENDING 
    return claimedOrder
}

const cancelOrder = async (orderId, userData, reason) => {
    const order = await OrderModel.findById(orderId)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.user.toString() !== userData._id.toString()) {
        throw new ApiError(403, "You are not authorized to cancel this order")
    }

    if (order.orderStatus === "CANCELLED") {
        throw new ApiError(400, "Order is already cancelled")
    }

    if (order.orderStatus === "CANCELLING") {
        throw new ApiError(409, "Order cancellation is already in progress")
    }

    if (order.paymentMethod === "COD") {
        return cancelCodOrder(order, reason)
    }

    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PENDING") {
        return cancelPendingOnlineOrder(order, reason)
    }

    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
        return cancelPaidOnlineOrder(order, reason)
    }

    throw new ApiError(400, "Order cannot be cancelled in its current state")
}

module.exports = {
    cancelOrder,
    cancelCodOrder,
    cancelPendingOnlineOrder,
    cancelPaidOnlineOrder
}
