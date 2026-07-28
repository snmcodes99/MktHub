const express=require("express")
const reviewController=require("../controllers/reviewController")
const authMiddleware=require("../middleware/auth/authMiddleware")
const requireVerifiedEmail=require("../middleware/auth/requireVerifiedEmail")
const validateAllowedFields=require("../middleware/validation/validateAllowedField")
const {createReviewValidation,updateReviewValidation}=require("../middleware/validation/reviewValidation")
const {mongoIdValidation}=require("../middleware/validation/commonValidation")
const validate=require("../middleware/validation/validate")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")
const router=express.Router()

router.post("/",
    createRateLimiter(15 * 60 * 1000, 10, "Too many review creation attempts. Please try again after 15 minutes."),
    authMiddleware,
    requireVerifiedEmail,
    validateAllowedFields([
        "productId",
        "rating",
        "comment"
    ]),
    createReviewValidation,
    validate,
    reviewController.createReview
)

router.get("/product/:productId",
    mongoIdValidation("productId"),
    validate,
    reviewController.getProductReviews
)

router.patch("/:id",
    createRateLimiter(15 * 60 * 1000, 20, "Too many review update attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validateAllowedFields([
        "rating",
        "comment"
    ]),
    updateReviewValidation,
    validate,
    reviewController.updateReview
)

router.delete("/:id",
    createRateLimiter(15 * 60 * 1000, 20, "Too many review deletion attempts. Please try again after 15 minutes."),
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    reviewController.deleteReview
)

module.exports=router
