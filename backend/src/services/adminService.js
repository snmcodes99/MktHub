const UserModel = require("../models/User")
const ProductModel = require("../models/Product")
const OrderModel = require("../models/Order")
const SellerRequestModel = require("../models/sellerRequest")

const getDashboardStats = async () => {
    // OPTIMIZATION: Instead of sending 15+ separate count queries to the database,
    // we use advanced MongoDB aggregations ($group) to calculate everything in just a few passes.
    
    const [
        userStatsAggregation,
        productStatsAggregation,
        orderStatsAggregation,
        pendingSellerRequests
    ] = await Promise.all([
        // 1. User Statistics
        UserModel.aggregate([
            // $group: Group all documents together (_id: null) and conditionally count roles
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalCustomers: { $sum: { $cond: [{ $eq: ["$role", "CUSTOMER"] }, 1, 0] } },
                    totalSellers: { $sum: { $cond: [{ $eq: ["$role", "SELLER"] }, 1, 0] } },
                    totalAdmins: { $sum: { $cond: [{ $eq: ["$role", "ADMIN"] }, 1, 0] } }
                }
            }
        ]),

        // 2. Product Statistics
        ProductModel.aggregate([
            // $group: Count total, active, and inactive products in one pass
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                    inactiveProducts: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } }
                }
            }
        ]),

        // 3. Order Statistics & Revenue
        OrderModel.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ["$paymentStatus", "PAID"] },
                                        { $ne: ["$orderStatus", "CANCELLED"] },
                                        { $ne: ["$orderStatus", "RETURNED"] }
                                    ] 
                                },
                                "$totalPrice",
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // 4. Pending Seller Requests
        SellerRequestModel.countDocuments({ status: "PENDING" })
    ]);

    // Extract Data from Aggregations (handle empty collections gracefully)
    const userStats = userStatsAggregation[0] || { totalUsers: 0, totalCustomers: 0, totalSellers: 0, totalAdmins: 0 };
    const productStats = productStatsAggregation[0] || { totalProducts: 0, activeProducts: 0, inactiveProducts: 0 };
    
    // Parse the Order group results into a flat object for the frontend
    let totalOrders = 0;
    let totalRevenue = 0;
    const orderCounts = {
        PENDING: 0, PROCESSING: 0, SHIPPED: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0
    };

    orderStatsAggregation.forEach(group => {
        totalOrders += group.count;
        totalRevenue += group.revenue || 0; // Revenue is only > 0 on the DELIVERED group
        if (orderCounts[group._id] !== undefined) {
            orderCounts[group._id] = group.count;
        }
    });

    return {
        totalUsers: userStats.totalUsers,
        totalCustomers: userStats.totalCustomers,
        totalSellers: userStats.totalSellers,
        totalAdmins: userStats.totalAdmins,

        totalProducts: productStats.totalProducts,
        activeProducts: productStats.activeProducts,
        inactiveProducts: productStats.inactiveProducts,

        totalOrders,
        pendingOrders: (orderCounts.PENDING || 0) + (orderCounts.PLACED || 0),
        processingOrders: orderCounts.PROCESSING || 0,
        shippedOrders: orderCounts.SHIPPED || 0,
        outForDeliveryOrders: orderCounts.OUT_FOR_DELIVERY,
        deliveredOrders: orderCounts.DELIVERED,
        cancelledOrders: orderCounts.CANCELLED,

        totalRevenue,
        pendingSellerRequests
    };
}

const ApiError = require("../utils/ApiErrors")

const getAllUsers = async () => {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users;
}

const updateUserRole = async (userId, role) => {
    // Admins can only change users to SELLER or CUSTOMER (to ban/revoke sellers). 
    // They cannot promote others to ADMIN.
    if (!["CUSTOMER", "SELLER"].includes(role)) {
        throw new ApiError(403, "Cannot promote users to this role");
    }
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

const toggleUserBan = async (userId, isBanned) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.role === "ADMIN") {
        throw new ApiError(403, "Cannot ban an administrator");
    }
    user.isBanned = isBanned;
    await user.save();
    return user;
}

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    toggleUserBan
}
