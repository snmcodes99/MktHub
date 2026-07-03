const OrderModel = require("../../models/Order")
const ProductModel = require("../../models/Product")
const CartModel = require("../../models/Cart")
const AddressModel = require("../../models/Address")
const ApiError = require("../../utils/ApiErrors")
const {reduceStock,
    restoreStock,
    createOrder,
    getOrderItems,
    getShippingAddress,
    clearCart,
    validateProducts,
    generateOrderNumber}=require("./orderHelper")

const placeOrder = async (orderData, userData) => {
    const orderItems = await getOrderItems(orderData, userData)
    const address = await getShippingAddress(orderData.addressId, userData)
    const { orderProductSnapshot, totalPrice } = await validateProducts(orderItems)
    const orderNumber = generateOrderNumber()
    const newOrder = await createOrder(orderNumber, userData, address, orderProductSnapshot, totalPrice, orderData.paymentMethod)
    if (orderData.paymentMethod === "COD") {
        await reduceStock(orderProductSnapshot)
        await clearCart(userData)
    }
    return newOrder
}

const getMyOrders = async (userData) => {
    const orders = await OrderModel.find({
        user: userData._id
    }).sort({
        createdAt: -1
    })
    return orders
}
const getOrderById = async (orderId, userData) => {
    const order = await OrderModel.findOne({ _id: orderId, user: userData._id })
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    return order
}


const cancelOrder = async (orderId, userData) => {
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
    if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)) {
        throw new ApiError(400, "Order cannot be cancelled")
    }
    order.orderStatus = "CANCELLED"
    if (order.paymentMethod === "COD") {
        await restoreStock(order.items)
    }
    await order.save()

    return order

}
const getAllOrders = async () => {
    const orders = await OrderModel.find()
        .sort({
            createdAt: -1
        }).populate("user", "name email")
    return orders
}
const validTransitions = {
    PLACED: [
        "PROCESSING",
        "CANCELLED"
    ],
    PROCESSING: [
        "SHIPPED",
        "CANCELLED"
    ],
    SHIPPED: [
        "OUT_FOR_DELIVERY"
    ],
    OUT_FOR_DELIVERY: [
        "DELIVERED"
    ],
    DELIVERED: [],
    CANCELLED: []
}
const updateOrderStatus = async (orderId, status) => {
    const order = await OrderModel.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    if (order.orderStatus === status) {
        throw new ApiError(400, "Order already has this status")
    }
    if (!validTransitions[order.orderStatus].includes(status)) {
        throw new ApiError(400, "Invalid order status transition")
    }
    order.orderStatus = status
    await order.save()
    return order
}

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
}