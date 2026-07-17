const express = require("express")

const orderController = require("../controllers/orderController")

const authMiddleware = require("../middleware/auth/authMiddleware")
const authorize = require("../middleware/auth/authorize")
const ensureSellerNotBanned = require("../middleware/auth/ensureSellerNotBanned")

const validate = require("../middleware/validation/validate")
const validateAllowedFields = require("../middleware/validation/validateAllowedField")

const { placeOrderValidation, updateOrderStatusValidation, getOrdersValidation } = require("../middleware/validation/orderValidation")

const {mongoIdValidation} = require("../middleware/validation/commonValidation")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")

const router = express.Router()

router.post("/",
    createRateLimiter(15 * 60 * 1000, 10, "Too many orders placed. Please try again after 15 minutes."),
    authMiddleware,
    validateAllowedFields([
        "addressId",
        "paymentMethod",
        "source",
        "productId",
        "quantity"
    ]),
    placeOrderValidation,
    validate,
    orderController.placeOrder
)

router.get("/my-orders",
    authMiddleware,
    orderController.getMyOrders
)

router.get("/:id",
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    orderController.getOrderById
)

router.patch("/:id/cancel",
    createRateLimiter(15 * 60 * 1000, 10, "Too many cancel attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    orderController.cancelOrder
)

router.patch("/:id/return",
    createRateLimiter(15 * 60 * 1000, 10, "Too many return attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    orderController.returnOrder
)

router.get("/",
    authMiddleware,
    authorize("ADMIN"),
    getOrdersValidation,
    validate,
    orderController.getAllOrders
)

router.get("/seller/orders",
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    getOrdersValidation,
    validate,
    orderController.getSellerOrders
)

router.patch("/:id/status",
    createRateLimiter(15 * 60 * 1000, 100, "Too many status updates. Please try again after 15 minutes."),
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    ensureSellerNotBanned,
    validateAllowedFields([
        "status"
    ]),
    mongoIdValidation("id"),
    updateOrderStatusValidation,
    validate,
    orderController.updateOrderStatus
)

module.exports = router