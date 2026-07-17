const express = require("express");

const categoryController=require("../controllers/categoryController");

const authMiddleware=require("../middleware/auth/authMiddleware");
const authorize=require("../middleware/auth/authorize");

const validateAllowedField=require("../middleware/validation/validateAllowedField");
const validate=require("../middleware/validation/validate")
const {createCategoryValidation,updateCategoryValidation,}=require("../middleware/validation/categoryValidation");
const { mongoIdValidation } = require("../middleware/validation/commonValidation");
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter");



const router = express.Router();
router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  createRateLimiter(15 * 60 * 1000, 20, "Too many category creation attempts. Please try again after 15 minutes."),
  authMiddleware,
  authorize("ADMIN"),
  validateAllowedField(["name"]),
  createCategoryValidation,
  validate,
  categoryController.createCategory
);

router.patch(
  "/:id",
  createRateLimiter(15 * 60 * 1000, 20, "Too many category update attempts. Please try again after 15 minutes."),
  authMiddleware,
  authorize("ADMIN"),
  mongoIdValidation("id"),
  validateAllowedField(["name"]),
  updateCategoryValidation,
  validate,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  createRateLimiter(15 * 60 * 1000, 20, "Too many category deletion attempts. Please try again after 15 minutes."),
  authMiddleware,
  mongoIdValidation("id"),
  authorize("ADMIN"),
  categoryController.deleteCategory
);

module.exports = router;