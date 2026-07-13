const mongoose = require("mongoose")
const ReservationModel = require("../models/Reservation")
const PaymentModel = require("../models/Payment")
const OrderModel = require("../models/Order")
const { releaseReserveInventory } = require("./inventoryService")
const { reconcilePayment, processSuccessfulPayment } = require("./paymentService")
const ApiError = require("../utils/ApiErrors")

const GRACE_PERIOD_MS = 2*60* 1000
const processExpiredReservation = async (reservationId) => {
    const reservation = await ReservationModel.findOne({
        _id: reservationId,
        status: "PENDING",
        expiresAt: {
            $lte: new Date(Date.now() - GRACE_PERIOD_MS)
        }
    })
    if (!reservation) {
        return {
            skipped: true
        }
    }
    const payment = await PaymentModel.findOne({
        reservation: reservation._id
    })
    if (payment?.status === "SUCCESS") {
        return {
            skipped: true,
            reason: "PAYMENT_SUCCESS"
        }
    }
    if (payment?.status === "PROCESSING") {
        return {
            skipped: true,
            reason: "PAYMENT_PROCESSING"
        }
    }
    if (payment?.status === "PENDING") {
        const reconciliation = await reconcilePayment(payment)
        if (reconciliation.state === "CAPTURED") {
            await processSuccessfulPayment(reconciliation.paymentEntity)
            return {
                recovered: true
            }
        }

        if (reconciliation.state === "AUTHORIZED") {
            return {
                skipped: true,
                reason: "PAYMENT_AUTHORIZED"
            }
        }
    }

    // Expiry transaction
    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const claimedReservation = await ReservationModel.findOneAndUpdate(
            {
                _id: reservation._id,
                status: "PENDING",
                expiresAt: {
                    $lte: new Date(Date.now() - GRACE_PERIOD_MS)
                }
            },
            {
                $set: {
                    status: "PROCESSING"
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!claimedReservation) {
            await session.abortTransaction()

            return {
                skipped: true,
                reason: "RESERVATION_ALREADY_CLAIMED"
            }
        }

        const claimedPayment = await PaymentModel.findOneAndUpdate(
            {
                reservation: claimedReservation._id,
                status: "PENDING"
            },
            {
                $set: {
                    status: "EXPIRED"
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (payment?.status === "PENDING" && !claimedPayment) {
            throw new ApiError(
                409,
                "Payment state changed during reservation expiry"
            )
        }

        await releaseReserveInventory(claimedReservation.items, session)

        if (claimedPayment && claimedPayment.order) {
            const cancelledOrder = await OrderModel.findOneAndUpdate(
                {
                    _id: claimedPayment.order,
                    orderStatus: "PENDING"
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
                throw new ApiError(
                    409,
                    "Order state changed during reservation expiry"
                )
            }
        }

        const expiredReservation = await ReservationModel.findOneAndUpdate(
            {
                _id: claimedReservation._id,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "EXPIRED",
                    cleanupAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!expiredReservation) {
            throw new ApiError(
                409,
                "Reservation state changed during expiry"
            )
        }

        await session.commitTransaction()

        return {
            expired: true,
            reservationId: expiredReservation._id
        }

    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        await session.endSession()
    }
}


module.exports = { processExpiredReservation }