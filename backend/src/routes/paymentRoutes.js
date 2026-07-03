const express=require("express")
const paymentController=require("../controllers/paymentController")
const authMiddleware=require("../middleware/auth/authMiddleware")
const validateAllowedFields=require("../middleware/validation/validateAllowedField")
const {processPaymentValidation}=require("../middleware/validation/paymentValidation")
const {mongoIdValidation}=require("../middleware/validation/commonValidation")
const validate=require("../middleware/validation/validate")
const router=express.Router()

router.post("/checkout",
    authMiddleware,
    validateAllowedFields([
        "orderId",
        "status"
    ]),
    processPaymentValidation,
    validate,
    paymentController.processPayment
)

router.get("/status/:orderId",
    authMiddleware,
    mongoIdValidation("orderId"),
    validate,
    paymentController.getPaymentStatus
)

module.exports=router
