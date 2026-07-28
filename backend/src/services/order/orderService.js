const OrderModel = require("../../models/Order")
const { generateInvoicePDF } = require("../../utils/pdfGenerator")
const ProductModel = require("../../models/Product")
const CartModel = require("../../models/Cart")
const AddressModel = require("../../models/Address")
const ApiError = require("../../utils/ApiErrors")
const mongoose = require("mongoose")
const { getPagination, buildPagination } = require("../../utils/pagination.utils")
const { buildOrderQuery } = require("../../utils/orderQuery.util")
const { createOrder, getOrderItems, getShippingAddress, clearCart, validateProducts, generateOrderNumber } = require("./orderHelper")
const { reduceStock, restoreStock } = require("../inventoryService")
const { cancelOrder: performCancelOrder } = require("../cancellationService")
const invoiceQueue = require("../../jobs/invoice/invoiceQueue")

const placeOrder = async (orderData, userData) => {

    if (orderData.paymentMethod !== "COD") {
        throw new ApiError(
            400,
            "Online orders must be created through the payment flow"
        );
    }

    const orderItems = await getOrderItems(orderData, userData);

    const address = await getShippingAddress(
        orderData.addressId,
        userData
    );

    const {
        orderProductSnapshot,
        totalPrice
    } = await validateProducts(orderItems);

    const orderNumber = generateOrderNumber();

    const session = await mongoose.startSession();

    let newOrder;

    try {

        session.startTransaction();

        await reduceStock(
            orderProductSnapshot,
            session
        );

        newOrder = await createOrder(
            orderNumber,
            userData,
            address,
            orderProductSnapshot,
            totalPrice,
            "COD",
            session
        );

        if (orderData.source === "CART") {
            await clearCart(
                userData,
                session
            );
        }

        await session.commitTransaction();

    } catch (error) {

        await session.abortTransaction();
        throw error;

    } finally {

        await session.endSession();

    }

    try {

        await invoiceQueue.add(
            "generate-invoice",
            {
                orderId: newOrder._id
            }
        );

    } catch (err) {

        console.error(
            "Failed to queue invoice generation:",
            err.message
        );

    }

    return newOrder;

};

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
    const order = await OrderModel.findOne({ _id: orderId, user: userData._id }).populate({
        path: "items.product",
        select: "name images"
    })
    if (!order) {
        throw new ApiError(404, "Order not found")
    }
    return order
}

const cancelOrder = async (orderId, userData, reason) => {
    return await performCancelOrder(orderId, userData, reason)
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
    CANCELLING: [],
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

    if (!validTransitions[order.orderStatus]?.includes(status)) {
        throw new ApiError(400, "Invalid order status transition")
    }

    const update = {
        orderStatus: status
    }

    if (status === "DELIVERED") {
        update.deliveredAt = new Date()

        if (order.paymentMethod === "COD") {
            update.paymentStatus = "PAID"
        }
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
        {
            _id: orderId,
            orderStatus: order.orderStatus
        },
        {
            $set: update
        },
        {
            returnDocument: "after"
        }
    )

    if (!updatedOrder) {
        throw new ApiError(
            409,
            "Order status changed during update. Please retry."
        )
    }

    return updatedOrder
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
const downloadInvoice = async (orderId, user) => {

    const order = await OrderModel.findOne({
        _id: orderId,
        user: user._id
    }).populate("user", "name email phone");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const pdfBuffer = await generateInvoicePDF(order);

    return {
        pdfBuffer,
        orderNumber: order.orderNumber
    };
};
module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getSellerOrders,
    downloadInvoice
}