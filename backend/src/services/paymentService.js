const razorpay = require("../config/razorpay")
const PaymentModel = require("../models/Payment")
const ReservationModel = require("../models/Reservation")
const { releaseReserveInventory, confirmReservedInventory } = require("./inventoryService")
const { createReservation } = require("./reservationService")
const mongoose = require("mongoose")
const OrderModel = require("../models/Order")
const { generateOrderNumber, clearCart } = require("./order/orderHelper")
const ApiError = require("../utils/ApiErrors")

const createPayment = async (checkoutData, userData) => {
    let reservation = null
    let payment = null
    let order = null
    try {
        reservation = await createReservation(checkoutData, userData)

        const orderNumber = generateOrderNumber()

        const [newOrder] = await OrderModel.create([{
            orderNumber,
            user: reservation.user,
            items: reservation.items.map((item) => ({
                product: item.product,
                productName: item.productName,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity
            })),
            shippingAddress: reservation.shippingAddress,
            totalPrice: reservation.totalAmount,
            paymentMethod: "ONLINE",
            paymentStatus: "PENDING",
            orderStatus: "PENDING"
        }])
        
        order = newOrder

        payment = await PaymentModel.create({
            user: userData._id,
            reservation: reservation._id,
            order: order._id,
            amount: reservation.totalAmount,
            currency: "INR",
            provider: "RAZORPAY",
            status: "PENDING"
        })

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(reservation.totalAmount * 100),
            currency: "INR",
            receipt: `res_${reservation._id}`
        })

        payment.gatewayOrderId = razorpayOrder.id

        await payment.save()

        if (checkoutData.source === "CART") {
            try {
                await clearCart(userData)
            } catch (cartError) {
                console.error("Failed to clear cart after successful checkout initialization:", cartError)
            }
        }

        return {
            reservationId: reservation._id,
            paymentId: payment._id,
            gatewayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }
    } catch (error) {
        if (!reservation) {
            throw error
        }

        const session = await mongoose.startSession()

        try {
            session.startTransaction()
            const claimedReservation = await ReservationModel.findOneAndUpdate(
                {
                    _id: reservation._id,
                    status: "PENDING"
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
            if (claimedReservation) {
                await releaseReserveInventory(claimedReservation.items, session)
                claimedReservation.status = "CANCELLED"
                claimedReservation.cleanupAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                await claimedReservation.save({ session })
                if (payment) {
                    await PaymentModel.findByIdAndUpdate(
                        payment._id,
                        {
                            $set: {
                                status: "FAILED",
                                failureReason: error.message
                            }
                        },
                        {
                            returnDocument: "after",
                            session
                        }
                    )
                }
                if (order) {
                    await OrderModel.findByIdAndUpdate(
                        order._id,
                        {
                            $set: {
                                orderStatus: "CANCELLED"
                            }
                        },
                        {
                            returnDocument: "after",
                            session
                        }
                    )
                }
            }
            await session.commitTransaction()

        } catch (compensationError) {
            await session.abortTransaction()
            throw compensationError
        } finally {
            await session.endSession()
        }
        throw error
    }

}

const processSuccessfulPayment = async (paymentEntity) => {
    const {
        id: gatewayPaymentId,
        order_id: gatewayOrderId,
        amount,
        currency,
        status
    } = paymentEntity

    if (status !== "captured") {
        throw new ApiError(400, "Payment is not captured")
    }

    const payment = await PaymentModel.findOne({
        gatewayOrderId
    })

    if (!payment) {
        throw new ApiError(404, "Payment record not found")
    }

    if (payment.status === "SUCCESS") {
        return {
            alreadyProcessed: true
        }
    }

    if (
        Math.round(payment.amount * 100) !== amount ||
        payment.currency !== currency
    ) {
        throw new ApiError(400, "Payment details mismatch")
    }

    const claimedPayment = await PaymentModel.findOneAndUpdate(
        {
            _id: payment._id,
            status: "PENDING"
        },
        {
            $set: {
                status: "PROCESSING",
                gatewayPaymentId
            }
        },
        {
            returnDocument: "after"
        }
    )

    if (!claimedPayment) {
        const latestPayment = await PaymentModel.findById(payment._id)

        if (latestPayment?.status === "SUCCESS") {
            return {
                alreadyProcessed: true
            }
        }

        if (latestPayment?.status === "EXPIRED" || latestPayment?.status === "CANCELLED") {
            const fallbackOrder = await OrderModel.findById(latestPayment.order)
            if (fallbackOrder && fallbackOrder.orderStatus === "CANCELLED") {
                const { initiateLateCaptureRefund } = require("./refundService")
                latestPayment.gatewayPaymentId = gatewayPaymentId
                await latestPayment.save()
                await initiateLateCaptureRefund(fallbackOrder, paymentEntity)
                return {
                    latePaymentRefunded: true
                }
            }
        }

        return {
            alreadyProcessing: true
        }
    }

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const reservation = await ReservationModel.findOneAndUpdate(
            {
                _id: claimedPayment.reservation,
                status: "PENDING"
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

        if (!reservation) {
            throw new ApiError(
                409,
                "Reservation is no longer available for confirmation"
            )
        }

        await confirmReservedInventory(reservation.items, session)

        const existingOrder = await OrderModel.findOneAndUpdate(
            {
                _id: claimedPayment.order,
                orderStatus: "PENDING"
            },
            {
                $set: {
                    orderStatus: "PLACED",
                    paymentStatus: "PAID"
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!existingOrder) {
            throw new ApiError(409, "Order is no longer available for confirmation or state changed")
        }

        const confirmedReservation = await ReservationModel.findOneAndUpdate(
            {
                _id: reservation._id,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "CONFIRMED"
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!confirmedReservation) {
            throw new ApiError(409, "Reservation state changed during processing")
        }

        const successfulPayment = await PaymentModel.findOneAndUpdate(
            {
                _id: claimedPayment._id,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "SUCCESS",
                    paidAt: new Date()
                }
            },
            {
                returnDocument: "after",
                session
            }
        )

        if (!successfulPayment) {
            throw new ApiError(409, "Payment state changed during processing")
        }

        await session.commitTransaction()
        return {
            alreadyProcessed: false,
            orderId: existingOrder._id,
            orderNumber: existingOrder.orderNumber
        }
    } catch (error) {
        await session.abortTransaction()

        await PaymentModel.findOneAndUpdate(
            {
                _id: claimedPayment._id,
                status: "PROCESSING"
            },
            {
                $set: {
                    status: "PENDING"
                }
            }
        )
        throw error
    } finally {
        await session.endSession()
    }
}

const reconcilePayment = async (payment) => {
    if (!payment.gatewayOrderId) {
        return {
            state: "NOT_PAID"
        }
    }
    const result = await razorpay.orders.fetchPayments(
        payment.gatewayOrderId
    )
    const capturedPayment = result.items?.find(
        (item) => item.status === "captured"
    )
    if (capturedPayment) {
        return {
            state: "CAPTURED",
            paymentEntity: capturedPayment
        }
    }
    const authorizedPayment = result.items?.find(
        (item) => item.status === "authorized"
    )
    if (authorizedPayment) {
        return {
            state: "AUTHORIZED",
            paymentEntity: authorizedPayment
        }
    }
    return {
        state: "NOT_PAID"
    }
}

module.exports = {
    createPayment,
    processSuccessfulPayment,
    reconcilePayment
}