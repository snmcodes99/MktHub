const { body } = require("express-validator")

const createPaymentValidation = [

    body("source")
        .isIn(["CART", "BUY_NOW"])
        .withMessage("Source must be either CART or BUY_NOW"),

    body("addressId")
        .isMongoId()
        .withMessage("Invalid address ID"),

    body("productId")
        .if(body("source").equals("BUY_NOW"))
        .notEmpty()
        .withMessage("Product ID is required for BUY_NOW")
        .bail()
        .isMongoId()
        .withMessage("Invalid product ID"),

    body("quantity")
        .if(body("source").equals("BUY_NOW"))
        .notEmpty()
        .withMessage("Quantity is required for BUY_NOW")
        .bail()
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1")
]

module.exports = {
    createPaymentValidation
}