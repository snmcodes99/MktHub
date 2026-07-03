const UserModel = require("../models/User")
const ProductModel = require("../models/Product")
const OrderModel = require("../models/Order")
const SellerRequestModel = require("../models/sellerRequest")

const getDashboardStats = async () => {
    // We execute all independent database queries simultaneously for maximum efficiency
    const [
        totalUsers,
        totalCustomers,
        totalSellers,
        totalAdmins,

        totalProducts,
        activeProducts,
        inactiveProducts,

        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,

        pendingSellerRequests,

        revenueAggregation
    ] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ role: "CUSTOMER" }),
        UserModel.countDocuments({ role: "SELLER" }),
        UserModel.countDocuments({ role: "ADMIN" }),

        ProductModel.countDocuments(),
        ProductModel.countDocuments({ isActive: true }),
        ProductModel.countDocuments({ isActive: false }),

        OrderModel.countDocuments(),
        OrderModel.countDocuments({ orderStatus: "PENDING" }),
        OrderModel.countDocuments({ orderStatus: "PROCESSING" }),
        OrderModel.countDocuments({ orderStatus: "SHIPPED" }),
        OrderModel.countDocuments({ orderStatus: "OUT_FOR_DELIVERY" }),
        OrderModel.countDocuments({ orderStatus: "DELIVERED" }),
        OrderModel.countDocuments({ orderStatus: "CANCELLED" }),

        SellerRequestModel.countDocuments({ status: "PENDING" }),

        OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    orderStatus: "DELIVERED"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ])
    ])

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0

    return {
        totalUsers,
        totalCustomers,
        totalSellers,
        totalAdmins,

        totalProducts,
        activeProducts,
        inactiveProducts,

        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,

        totalRevenue,

        pendingSellerRequests
    }
}

module.exports = {
    getDashboardStats
}
