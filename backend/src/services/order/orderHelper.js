const OrderModel = require("../../models/Order")
const ProductModel = require("../../models/Product")
const CartModel = require("../../models/Cart")
const AddressModel = require("../../models/Address")
const ApiError = require("../../utils/ApiErrors")
const getOrderItems = async (orderData, userData) => {
    const { source, productId, quantity } = orderData
    if (source === "CART") {
        const cart = await CartModel.findOne({ user: userData._id })
        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty")
        }
        return cart.items
    }
    if (source === "BUY_NOW") {
        return [
            {
                product: productId,
                quantity
            }
        ]
    }
    throw new ApiError(400, "invalid checkout")
}
const getShippingAddress = async (addressId, userData) => {
    const address = await AddressModel.findOne({
        _id: addressId,
        user: userData._id
    })
    if (!address) {
        throw new ApiError(404, "Address not found")
    }
    return address
}

const clearCart = async (userData, session = null) => {
    await CartModel.findOneAndUpdate(
        {
            user: userData._id
        },
        {
            items: [],
            totalPrice: 0
        },
        { session }
    )
}
const validateProducts = async (orderItems) => {
    const productIds = orderItems.map(item => item.product)
    const products = await ProductModel.find({
        _id: { $in: productIds },
        isActive: true
    })
    const productMap = new Map()
    products.forEach(product => {
        productMap.set(product._id.toString(), product)
    })
    const orderProductSnapshot = []
    let totalPrice = 0
    for (const item of orderItems) {
        const product = productMap.get(item.product.toString())
        if (!product) {
            throw new ApiError(404, "Product not found")
        }
        const availableStock = product.stock - product.reservedStock
        if (availableStock < item.quantity) {
            throw new ApiError(400, `${product.name} has only ${availableStock} items available`)
        }
        orderProductSnapshot.push({
            product: product._id,
            productName: product.name,
            sellingPrice: product.sellingPrice,
            quantity: item.quantity
        })
        totalPrice += product.sellingPrice * item.quantity
    }
    return {
        orderProductSnapshot,
        totalPrice
    }
}
const createOrder = async (orderNumber, userData, address, orderProductSnapshot, totalPrice, paymentMethod, session = null) => {
    const [newOrder] = await OrderModel.create([{
        orderNumber,
        user: userData._id,
        items: orderProductSnapshot,
        shippingAddress: {
            name: address.name,
            phoneNo: address.phoneNo,
            houseNo: address.houseNo,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            zipCode: address.zipCode
        },
        totalPrice,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: paymentMethod === "COD" ? "PLACED" : "PENDING"
    }], { session })
    return newOrder
}
const generateOrderNumber = () => {
    return `ORD-${Date.now()}`
}



module.exports = {
    createOrder,
    getOrderItems,
    getShippingAddress,
    clearCart,
    validateProducts,
    generateOrderNumber
}