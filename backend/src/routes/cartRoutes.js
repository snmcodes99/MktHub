const express=require("express")
const cartController=require("../controllers/cartController")
const authMiddleware=require("../middleware/auth/authMiddleware")
const validateAllowedFields=require("../middleware/validation/validateAllowedField")
const {addToCartValidation,updateCartValidation}=require("../middleware/validation/cartValidation")
const {mongoIdValidation}=require("../middleware/validation/commonValidation")
const validate=require("../middleware/validation/validate")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")
const router=express.Router()

router.post("/",
    createRateLimiter(5 * 60 * 1000, 100, "Too many add to cart attempts. Please try again after 5 minutes."),
    authMiddleware,
    validateAllowedFields([
        "productId",
        "quantity"
    ]),
    addToCartValidation,
    validate,
    cartController.addToCart
)

router.get("/",
    authMiddleware,
    cartController.getMyCart
)

router.patch("/:id",
    createRateLimiter(5 * 60 * 1000, 100, "Too many update cart attempts. Please try again after 5 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validateAllowedFields([
        "quantity"
    ]),
    updateCartValidation,
    validate,
    cartController.updateCartItem
)

router.delete("/:id",
    createRateLimiter(5 * 60 * 1000, 100, "Too many remove cart attempts. Please try again after 5 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    cartController.removeCartItem
)

module.exports=router