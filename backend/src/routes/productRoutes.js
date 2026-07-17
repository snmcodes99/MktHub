const express = require("express");

const authMiddleware=require("../middleware/auth/authMiddleware");
const authorize=require("../middleware/auth/authorize");
const ensureSellerNotBanned=require("../middleware/auth/ensureSellerNotBanned");

const validateAllowedField=require("../middleware/validation/validateAllowedField");
const validate=require("../middleware/validation/validate");

const productController=require("../controllers/productController");

const { getProductsValidation,createProductValidation, updateProductValidation } = require("../middleware/validation/productValidation");
const { mongoIdValidation } = require("../middleware/validation/commonValidation");
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter");

const router=express.Router();

router.get("/",getProductsValidation,validate,productController.getAllProducts)
router.get("/:id", mongoIdValidation("id"),validate,productController.getProductByid)

router.post("/",
    createRateLimiter(15 * 60 * 1000, 50, "Too many product creation attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("SELLER","ADMIN"),
    ensureSellerNotBanned,
    validateAllowedField([
        "name",
        "description",
        "brand",
        "category",
        "mrp",
        "sellingPrice",
        "stock",
        "images",
    ]),
    createProductValidation,
    validate,
    productController.createProduct
);

router.patch("/:id",
    createRateLimiter(15 * 60 * 1000, 50, "Too many product update attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    ensureSellerNotBanned,
    validateAllowedField([
        "name",
        "description",
        "brand",
        "category",
        "mrp",
        "sellingPrice",
        "stock",
        "images",
    ]),
    mongoIdValidation("id"),
    updateProductValidation,
    validate,
    productController.updateProduct
);

router.delete(
    "/:id",
    createRateLimiter(15 * 60 * 1000, 50, "Too many product deletion attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    ensureSellerNotBanned,
    mongoIdValidation("id"),
    validate,
    productController.deleteProduct
);

router.patch("/:id/toggle-active",
    createRateLimiter(15 * 60 * 1000, 30, "Too many toggle attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    ensureSellerNotBanned,
    mongoIdValidation("id"),
    validate,
    productController.toggleProductActive
);

module.exports=router