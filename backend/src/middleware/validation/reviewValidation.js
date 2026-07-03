const {body}=require("express-validator")

const createReviewValidation=[
    body("productId")
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id"),
    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({min:1,max:5})
        .withMessage("Rating must be between 1 and 5"),
    body("comment")
        .notEmpty()
        .withMessage("Comment is required")
        .isString()
        .withMessage("Comment must be a string")
        .trim()
        .isLength({min:3,max:500})
        .withMessage("Comment must be between 3 and 500 characters")
]

const updateReviewValidation=[
    body("rating")
        .optional()
        .isInt({min:1,max:5})
        .withMessage("Rating must be between 1 and 5"),
    body("comment")
        .optional()
        .isString()
        .withMessage("Comment must be a string")
        .trim()
        .isLength({min:3,max:500})
        .withMessage("Comment must be between 3 and 500 characters")
]

module.exports={
    createReviewValidation,
    updateReviewValidation
}
