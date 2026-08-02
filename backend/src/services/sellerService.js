const mongoose = require("mongoose");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const { getPagination, buildPagination } = require("../utils/pagination.utils");

const getDashboardStats = async (sellerId) => {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // OPTIMIZATION: Fetch the seller's product IDs once. 
    // We can use this array to drastically speed up Order aggregations using the $in operator, 
    // completely avoiding expensive $lookup joins across collections.
    const sellerProducts = await ProductModel.find({ seller: sellerObjectId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const results = await Promise.all([ // Execution of all stats queries in parallel
        ProductModel.countDocuments({ seller: sellerObjectId }),
        ProductModel.countDocuments({ seller: sellerObjectId, isActive: true }),
        
        OrderModel.aggregate([
            // $match: Filter down to successfully paid orders that are not cancelled or returned
            { $match: { paymentStatus: "PAID", orderStatus: { $nin: ["CANCELLED", "RETURNED"] } } },
            // $unwind: Deconstruct the items array so we can inspect individual products
            { $unwind: "$items" },
            // $match: Filter items to only include products owned by this seller
            { $match: { "items.product": { $in: sellerProductIds } } },
            // $group: Sum up the revenue (sellingPrice * quantity) for the matched items
            { $group: { _id: null, totalRevenue: { $sum: { $multiply: ["$items.sellingPrice", "$items.quantity"] } } } }
        ]),
        
        OrderModel.aggregate([
            // $match: Filter down to orders currently pending or placed
            { $match: { orderStatus: { $in: ["PENDING", "PLACED"] } } },
            // $unwind: Deconstruct items array
            { $unwind: "$items" },
            // $match: Filter items to only include products owned by this seller
            { $match: { "items.product": { $in: sellerProductIds } } },
            // $group: Group by order ID to ensure we don't double-count an order if it has multiple items from the seller
            { $group: { _id: "$_id" } },
            // $count: Output the total number of distinct pending orders
            { $count: "count" }
        ]),

        ProductModel.aggregate([
            // $match: Pre-filter orders to only those that contain at least one of the seller's products
            { $match: { seller: sellerObjectId, isActive: true, totalReviews: { $gt: 0 } } },
            // $group: Calculate the average rating across all these products
            { $group: { _id: null, storeRating: { $avg: "$averageRating" } } }
        ]),

        ProductModel.find({ seller: sellerObjectId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name sellingPrice stock isActive images"),

        OrderModel.aggregate([
            // $match: Pre-filter orders to only those that contain at least one of the seller's products
            { $match: { "items.product": { $in: sellerProductIds } } },
            // $unwind: Deconstruct the items array
            { $unwind: "$items" },
            // $match: Keep only the specific items belonging to the seller
            { $match: { "items.product": { $in: sellerProductIds } } },
            // $group: Re-group back to the order level to avoid duplicate rows for multi-item orders
            {
                $group: {
                    _id: "$_id",
                    orderNumber: { $first: "$orderNumber" },
                    orderStatus: { $first: "$orderStatus" },
                    createdAt: { $first: "$createdAt" },
                    user: { $first: "$user" }, // Keep reference to user for the lookup below
                    totalPrice: { $sum: { $multiply: ["$items.sellingPrice", "$items.quantity"] } }
                }
            },
            // $lookup: Join with the User collection to get the customer's name
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            // $unwind: Flatten the joined customer array
            { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
            // $addFields: Inject the customer's name at the root level for easy access on frontend
            {
                $addFields: {
                    customerName: "$customer.name"
                }
            },
            // $project: Clean up the output by hiding the full customer object
            { $project: { customer: 0, user: 0 } },
            // $sort: Order by newest first
            { $sort: { createdAt: -1 } },
            // $limit: Only take the 5 most recent
            { $limit: 5 }
        ]),
        
        // Stock Stats
        ProductModel.countDocuments({ seller: sellerObjectId, stock: 0 }),
        ProductModel.countDocuments({ seller: sellerObjectId, isActive: false }),

        // Revenue Trend (Last 7 Days)
        OrderModel.aggregate([
            { $match: { 
                paymentStatus: "PAID", 
                orderStatus: { $nin: ["CANCELLED", "RETURNED"] },
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            } },
            { $unwind: "$items" },
            { $match: { "items.product": { $in: sellerProductIds } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalRevenue: { $sum: { $multiply: ["$items.sellingPrice", "$items.quantity"] } }
            } },
            { $sort: { _id: 1 } }
        ]),

        // Top Selling Products
        OrderModel.aggregate([
            { $match: { paymentStatus: "PAID", orderStatus: { $nin: ["CANCELLED", "RETURNED"] } } },
            { $unwind: "$items" },
            { $match: { "items.product": { $in: sellerProductIds } } },
            { $group: { 
                _id: "$items.product",
                sold: { $sum: "$items.quantity" }
            } },
            { $sort: { sold: -1 } },
            { $limit: 4 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $project: { name: "$product.name", img: { $arrayElemAt: ["$product.images", 0] }, sold: 1 } }
        ])
    ]);

    const [
        totalProducts,
        activeProducts,
        revenueAggregation,
        pendingOrdersAggregation,
        storeRatingAggregation,
        recentProducts,
        recentOrders,
        outOfStockProducts,
        draftProducts,
        revenueTrendRaw,
        topProductsRaw
    ] = results;

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const ordersPending = pendingOrdersAggregation.length > 0 ? pendingOrdersAggregation[0].count : 0;
    const storeRating = storeRatingAggregation.length > 0 ? Number(storeRatingAggregation[0].storeRating.toFixed(1)) : 0;

    // Fill missing dates in the 7-day trend
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const match = revenueTrendRaw.find(r => r._id === dateStr);
        revenueTrend.push({
            name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            value: match ? match.totalRevenue : 0
        });
    }

    return {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        draftProducts,
        totalRevenue,
        ordersPending,
        storeRating,
        recentProducts,
        recentOrders,
        revenueTrend,
        topProducts: topProductsRaw
    };
};

const getSellerProducts = async (sellerId, query = {}) => {
    const { page, limit, skip } = getPagination(query);

    const { search } = query;
    const filter = { seller: sellerId };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } }
        ];
    }

    const products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name")
        .lean();

    const totalProducts = await ProductModel.countDocuments(filter);
    const pagination = buildPagination(page, limit, totalProducts);

    return {
        products,
        pagination
    };
};

module.exports = {
    getDashboardStats,
    getSellerProducts
};
