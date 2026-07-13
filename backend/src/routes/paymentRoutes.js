const express = require("express")

const paymentController = require("../controllers/paymentController")
const authMiddleware = require("../middleware/auth/authMiddleware")
const validateAllowedFields = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")
const { createPaymentValidation } = require("../middleware/validation/paymentValidation")

const router = express.Router()

router.post(
    "/create",
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