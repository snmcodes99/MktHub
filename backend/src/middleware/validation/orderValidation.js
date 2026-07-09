const { body, query } = require("express-validator")

const placeOrderValidation = [

    body("addressId")
        .isMongoId()
        .withMessage("Invalid address id"),
    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required")
        .toUpperCase()
        .isIn(["COD", "ONLINE"])
        .withMessage("Invalid payment method"),
    body("source")
        .notEmpty()
        .withMessage("Order source is required")
        .toUpperCase()
        .isIn(["CART", "BUY_NOW"])
        .withMessage("Invalid order source"),
    body("productId")
        .if(body("source").equals("BUY_NOW"))
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id"),
    body("quantity")
        .if(body("source").equals("BUY_NOW"))
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1")
]

const updateOrderStatusValidation = [
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .bail()
        .isIn([
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ])
        .withMessage("Invalid order status")
]

const getOrdersValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    query("orderStatus")
        .optional()
        .isIn([
            "PENDING",
            "PLACED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
            "RETURNED"
        ])
        .withMessage("Invalid order status"),
    query("paymentStatus")
        .optional()
        .isIn(["PENDING", "PAID", "FAILED"])
        .withMessage("Invalid payment status"),
    query("minAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum amount must be a positive number"),
    query("maxAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Maximum amount must be a positive number"),
    query("orderNumber")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("Order number search cannot exceed 50 characters"),
    query("sort")
        .optional()
        .isIn([
            "newest",
            "oldest",
            "-createdAt",
            "createdAt",
            "amount_asc",
            "amount_desc"
        ])
        .withMessage("Invalid sort option")
]

module.exports = {
    placeOrderValidation,
    updateOrderStatusValidation,
    getOrdersValidation
}