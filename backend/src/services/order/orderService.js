const OrderModel = require("../../models/Order")
const ProductModel = require("../../models/Product")
const CartModel = require("../../models/Cart")
const AddressModel = require("../../models/Address")
const ApiError = require("../../utils/ApiErrors")
const mongoose = require("mongoose")
const { getPagination, buildPagination } = require("../../utils/pagination.utils")
const { buildOrderQuery } = require("../../utils/orderQuery.util")
const { reduceStock, restoreStock, createOrder, getOrderItems, getShippingAddress, clearCart, validateProducts, generateOrderNumber } = require("./orderHelper")

const placeOrder = async (orderData, userData) => {
    const orderItems = await getOrderItems(orderData, userData)
    const address = await getShippingAddress(orderData.addressId, userData)
    const { orderProductSnapshot, totalPrice } = await validateProducts(orderItems)
    const orderNumber = generateOrderNumber()

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (orderData.paymentMethod === "COD") {
            await reduceStock(orderProductSnapshot, session)
        }

        const newOrder = await createOrder(orderNumber, userData, address, orderProductSnapshot, totalPrice, orderData.paymentMethod, session)

        if (orderData.paymentMethod === "COD") {
            await clearCart(userData, session)
        }

        await session.commitTransaction()
        return newOrder
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

const getMyOrders = async (userData) => {
    const orders = await OrderModel.find({
        user: userData._id
    }).populate({
        path: "items.product",
        select: "name images"
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

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (order.paymentMethod === "COD") {
            await restoreStock(order.items, session)
        }
        
        order.orderStatus = "CANCELLED"
        await order.save({ session })

        await session.commitTransaction()
        return order
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

const returnOrder = async (orderId, userData) => {
    const order = await OrderModel.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    if (order.user.toString() !== userData._id.toString()) {
        throw new ApiError(403, "You are not authorized to return this order")
    }
    if (order.orderStatus === "RETURNED") {
        throw new ApiError(400, "Order is already returned")
    }
    if (order.orderStatus !== "DELIVERED") {
        throw new ApiError(400, "Only delivered orders can be returned")
    }
    order.orderStatus = "RETURNED"
    // Handle stock and refunds logic if needed here
    await order.save()

    return order
}

const getAllOrders = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const { filter, sortOption } = buildOrderQuery(query);

    const [orders, totalItems] = await Promise.all([
        OrderModel.find(filter)
            .select("orderNumber totalPrice paymentStatus orderStatus paymentMethod createdAt items")
            .populate("user", "name email")
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),
        OrderModel.countDocuments(filter)
    ]);

    const pagination = buildPagination(page, limit, totalItems);

    return {
        orders,
        pagination
    };
}
const validTransitions = {
    PENDING: [
        "PLACED",
        "CANCELLED"
    ],
    PLACED: [
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    ],
    PROCESSING: [
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    ],
    SHIPPED: [
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ],
    OUT_FOR_DELIVERY: [
        "DELIVERED"
    ],
    DELIVERED: [
        "RETURNED"
    ],
    CANCELLED: [],
    RETURNED: []
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
    if (status === "DELIVERED" && order.paymentMethod === "COD") {
        order.paymentStatus = "PAID"
    }
    await order.save()
    return order
}

const getSellerOrders = async (sellerId, query = {}) => {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const sellerProducts = await ProductModel.find({ seller: sellerObjectId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const { page, limit, skip } = getPagination(query);
    const { filter, sortOption } = buildOrderQuery(query);

    const pipeline = [
        { $match: { "items.product": { $in: sellerProductIds } } },
        { $unwind: "$items" },
        { $match: { "items.product": { $in: sellerProductIds } } },
        {
            $group: {
                _id: "$_id",
                orderNumber: { $first: "$orderNumber" },
                orderStatus: { $first: "$orderStatus" },
                paymentStatus: { $first: "$paymentStatus" },
                paymentMethod: { $first: "$paymentMethod" },
                createdAt: { $first: "$createdAt" },
                user: { $first: "$user" },
                totalPrice: { $sum: { $multiply: ["$items.sellingPrice", "$items.quantity"] } },
                items: { $push: "$items" }
            }
        }
    ];
    if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
    }
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "customer"
            }
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                customerName: "$customer.name"
            }
        },
        { $project: { customer: 0, user: 0 } },
        {
            $facet: {
                data: [
                    { $sort: sortOption },
                    { $skip: skip },
                    { $limit: limit }
                ],
                metadata: [
                    { $count: "total" }
                ]
            }
        }
    );

    const result = await OrderModel.aggregate(pipeline);
    const orders = result[0].data;
    const totalItems = result[0].metadata[0]?.total || 0;

    const pagination = buildPagination(page, limit, totalItems);

    return {
        orders,
        pagination
    };
}

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    returnOrder,
    getAllOrders,
    updateOrderStatus,
    getSellerOrders
}