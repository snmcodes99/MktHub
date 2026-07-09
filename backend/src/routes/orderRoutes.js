const express = require("express")

const orderController = require("../controllers/orderController")

const authMiddleware = require("../middleware/auth/authMiddleware")
const authorize = require("../middleware/auth/authorize")

const validate = require("../middleware/validation/validate")
const validateAllowedFields = require("../middleware/validation/validateAllowedField")

const { placeOrderValidation, updateOrderStatusValidation, getOrdersValidation } = require("../middleware/validation/orderValidation")

const {mongoIdValidation} = require("../middleware/validation/commonValidation")

const router = express.Router()

router.post("/",
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
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    orderController.cancelOrder
)

router.patch("/:id/return",
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
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    validateAllowedFields([
        "status"
    ]),
    mongoIdValidation("id"),
    updateOrderStatusValidation,
    validate,
    orderController.updateOrderStatus
)

module.exports = router