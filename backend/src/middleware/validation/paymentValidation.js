const { body } = require("express-validator")

const processPaymentValidation = [
    body("orderId")
        .isMongoId()
        .withMessage("Invalid order id"),

    body("status")
        .isIn(["SUCCESS", "FAILED"])
        .withMessage("Invalid payment status")
]

module.exports = {
    processPaymentValidation
}