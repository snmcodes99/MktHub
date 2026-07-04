const OrderModel = require("../models/Order")
const ApiError = require("../utils/ApiErrors")
const {reduceStock,clearCart} = require("./order/orderHelper")

const processPayment = async (orderId, paymentData, userData) => {
    const { status } = paymentData
    const order = await OrderModel.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    if (order.user.toString() !== userData._id.toString()) {
        throw new ApiError(403, "You are not authorized to pay for this order")
    }
    if (order.paymentMethod !== "ONLINE") {
        throw new ApiError(400, "Payment is only available for online orders")
    }
    if (order.paymentStatus === "PAID") {
        throw new ApiError(400, "Payment already completed")
    }
    if (order.orderStatus === "CANCELLED") {
        throw new ApiError(400, "Cannot pay for a cancelled order")
    }
    const paymentResult = await simulatePayment(order.totalPrice)
    if (paymentResult.status === "SUCCESS") {
        await reduceStock(order.items)
        await clearCart(userData)
        order.paymentStatus = "PAID"
        order.orderStatus = "PLACED"
        await order.save()
        return {
            payment: paymentResult,
            order
        }
    }
    order.paymentStatus = "FAILED"
    await order.save()
    return {
        payment: paymentResult,
        order
    }

}

const simulatePayment = async (amount) => {
    // Business rule: simulate a realistic payment delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Business rule: 90% success rate for realistic testing
    const isSuccess = Math.random() < 0.9;

    if (isSuccess) {
        return {
            status: "SUCCESS",
            transactionId: `TXN-${Date.now()}`,
            message: "Payment processed successfully"
        }
    }
    return {
        status: "FAILED",
        transactionId: `TXN-${Date.now()}`,
        message: "Payment declined by the bank. Please try again."
    }
}

const getPaymentStatus = async (orderId, userData) => {
    const order = await OrderModel.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    if (order.user.toString() !== userData._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this payment")
    }
    return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice
    }
}

module.exports = {
    processPayment,
    getPaymentStatus
}