const express = require("express");

const authMiddleware=require("../middleware/auth/authMiddleware");
const authorize=require("../middleware/auth/authorize");
const requireVerifiedEmail = require("../middleware/auth/requireVerifiedEmail");

const validateAllowedField=require("../middleware/validation/validateAllowedField");
const validate=require("../middleware/validation/validate");

const sellerRequestController=require("../controllers/sellerReqController");

const { createSellerRequestValidation, rejectSellerRequestValidation } = require("../middleware/validation/sellerRequestValidation");
const { mongo } = require("mongoose");
const { mongoIdValidation } = require("../middleware/validation/commonValidation");
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter");

const router=express.Router();

router.post("/",
    createRateLimiter(60 * 60 * 1000, 5, "Too many seller requests. Please try again after 1 hour."),
    authMiddleware,
    requireVerifiedEmail,
    authorize("CUSTOMER"),
    validateAllowedField([
        "shopName",
        "businessDescription",
        "businessAddress",
        "documents"
    ]),
    createSellerRequestValidation,
    validate,
    sellerRequestController.createSellerRequest
)

router.get("/",
    authMiddleware,
    authorize("ADMIN"),
    sellerRequestController.getAllSellerRequests
);

router.get("/me",
    authMiddleware,
    authorize("CUSTOMER"),
    sellerRequestController.getMySellerRequest
)

router.patch("/:id/approve",
    createRateLimiter(15 * 60 * 1000, 20, "Too many approve attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validate,
    sellerRequestController.approveSellerRequest
)

router.patch("/:id/reject",
    createRateLimiter(15 * 60 * 1000, 20, "Too many reject attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validateAllowedField([
        "rejectionReason"
    ]),
    rejectSellerRequestValidation,
    validate,
    sellerRequestController.rejectSellerRequest
)
module.exports=router