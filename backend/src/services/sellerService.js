const mongoose = require("mongoose");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");

const getDashboardStats = async (sellerId) => {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // OPTIMIZATION: Fetch the seller's product IDs once. 
    // We can use this array to drastically speed up Order aggregations using the $in operator, 
    // completely avoiding expensive $lookup joins across collections.
    const sellerProducts = await ProductModel.find({ seller: sellerObjectId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const [
        totalProducts,
        activeProducts,
        revenueAggregation,
        pendingOrdersAggregation,
        storeRatingAggregation,
        recentProducts,
        recentOrders
    ] = await Promise.all([
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
            // $match: Find active products from this seller that have at least one review
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
        ])
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const ordersPending = pendingOrdersAggregation.length > 0 ? pendingOrdersAggregation[0].count : 0;
    const storeRating = storeRatingAggregation.length > 0 ? Number(storeRatingAggregation[0].storeRating.toFixed(1)) : 0;

    return {
        totalProducts,
        activeProducts,
        totalRevenue,
        ordersPending,
        storeRating,
        recentProducts,
        recentOrders
    };
};

module.exports = {
    getDashboardStats
};
