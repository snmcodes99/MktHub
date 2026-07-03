const express=require("express")
const reviewController=require("../controllers/reviewController")
const authMiddleware=require("../middleware/auth/authMiddleware")
const validateAllowedFields=require("../middleware/validation/validateAllowedField")
const {createReviewValidation,updateReviewValidation}=require("../middleware/validation/reviewValidation")
const {mongoIdValidation}=require("../middleware/validation/commonValidation")
const validate=require("../middleware/validation/validate")
const router=express.Router()

router.post("/",
    authMiddleware,
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
    authMiddleware,
    mongoIdValidation("id"),
    validate,
    reviewController.deleteReview
)

module.exports=router
