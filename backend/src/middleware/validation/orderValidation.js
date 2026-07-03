const { body } = require("express-validator")

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

module.exports = {
    placeOrderValidation,
    updateOrderStatusValidation
}