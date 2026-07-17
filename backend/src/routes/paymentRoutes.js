const express = require("express")

const paymentController = require("../controllers/paymentController")
const authMiddleware = require("../middleware/auth/authMiddleware")
const validateAllowedFields = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")
const { createPaymentValidation } = require("../middleware/validation/paymentValidation")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")

const router = express.Router()

router.post(
    "/create",
    createRateLimiter(15 * 60 * 1000, 10, "Too many payment creation attempts. Please try again after 15 minutes."),
    authMiddleware,
    validateAllowedFields([
        "source",
        "productId",
        "quantity",
        "addressId"
    ]),

    createPaymentValidation,

    validate,

    paymentController.createPayment
)

module.exports = router