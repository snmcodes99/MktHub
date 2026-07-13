const ProductModel = require("../models/Product")
const ApiError = require("../utils/ApiErrors")

const reserveInventory = async (items, session = null) => {
    const updates = []
    for (const item of items) {
        const product = await ProductModel.findOneAndUpdate(
            {
                _id: item.product,
                isActive: true,
                $expr: {
                    $gte: [{
                        $subtract: [
                            "$stock",
                            {
                                $ifNull: ["$reservedStock", 0]
                            }

                        ]
                    },
                    item.quantity
                    ]
                }
            },
            {
                $inc: {
                    reservedStock: item.quantity
                }
            },
            {
                returnDocument: "after",
                session
            }
        )
        if (!product) {
            throw new ApiError(400, "insufficient stock or product not found")
        }
        updates.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            stock: product.stock,
            reservedStock: product.reservedStock,
            availableStock: product.stock - product.reservedStock
        })
    }
    return updates
}

const confirmReservedInventory = async (items, session = null) => {
    const updates = [];
    for (const item of items) {
        const product = await ProductModel.findOneAndUpdate(
            {
                _id: item.product,
                reservedStock: {
                    $gte: item.quantity
                },
                stock: {
                    $gte: item.quantity
                }
            },
            {
                $inc: {
                    stock: -item.quantity,
                    reservedStock: -item.quantity
                }
            }, {
            returnDocument: "after",
            session
        }
        )
        if (!product) {
            throw new ApiError(400, `Unable to confirm reserved inventory for product ${item.product}`)
        }
        updates.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            stock: product.stock,
            reservedStock: product.reservedStock,
            availableStock: product.stock - product.reservedStock
        })
    }
    return updates;
}

const releaseReserveInventory = async (items, session = null) => {
    const updates = []
    for (const item of items) {
        const product = await ProductModel.findOneAndUpdate(
            {
                _id: item.product,
                reservedStock: {
                    $gte: item.quantity
                }
            },
            {
                $inc: {
                    reservedStock: -item.quantity
                }
            }, {
            returnDocument: "after",
            session
        }
        )
        if (!product) {
            throw new ApiError(400, `Unable to release reserved inventory for product ${item.product}`)
        }
        updates.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            stock: product.stock,
            reservedStock: product.reservedStock,
            availableStock: product.stock - product.reservedStock
        })
    }
    return updates
}

const restoreStock = async (items, session = null) => {
    const updates = []
    for (const item of items) {
        const product = await ProductModel.findOneAndUpdate(
            {
                _id: item.product
            },
            {
                $inc: {
                    stock: item.quantity
                }
            },
            {
                returnDocument: "after",
                session
            }
        )
        if (!product) {
            throw new ApiError(
                404,
                `Unable to restore stock for product ${item.product}`
            )
        }
        updates.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            stock: product.stock,
            reservedStock: product.reservedStock,
            availableStock: product.stock - product.reservedStock
        })
    }
    return updates
}
const reduceStock = async (items, session = null) => {
    const updates = []
    for (const item of items) {
        const product = await ProductModel.findOneAndUpdate(
            {
                _id: item.product,
                isActive: true,
                $expr: {
                    $gte: [
                        {
                            $subtract: [
                                "$stock",
                                "$reservedStock"
                            ]
                        },
                        item.quantity
                    ]
                }
            },
            {
                $inc: {
                    stock: -item.quantity
                }
            },
            {
                session,
                returnDocument: "after"
            }
        )

        if (!product) {
            throw new ApiError(400, "Insufficient available stock")
        }
        updates.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            stock: product.stock,
            reservedStock: product.reservedStock,
            availableStock: product.stock - product.reservedStock
        })
    }
    return updates
}
module.exports = {
    reserveInventory,
    releaseReserveInventory,
    confirmReservedInventory,
    reduceStock,
    restoreStock
}