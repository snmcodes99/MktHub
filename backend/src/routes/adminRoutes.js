const express = require("express")
const adminController = require("../controllers/adminController")
const authMiddleware = require("../middleware/auth/authMiddleware")
const authorize = require("../middleware/auth/authorize")
const { mongoIdValidation } = require("../middleware/validation/commonValidation")
const validateAllowedField = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")
const createRateLimiter = require("../middleware/rateLimit/createRateLimiter")
const router = express.Router()

router.get("/dashboard",
    authMiddleware,
    authorize("ADMIN"),
    adminController.getDashboardStats
)

router.get("/users",
    authMiddleware,
    authorize("ADMIN"),
    adminController.getAllUsers
)

router.patch("/users/:id/role",
    createRateLimiter(15 * 60 * 1000, 10, "Too many role update attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validateAllowedField(["role"]),
    validate,
    adminController.updateUserRole
)

router.patch("/users/:id/ban",
    createRateLimiter(15 * 60 * 1000, 10, "Too many ban/unban attempts. Please try again after 15 minutes."),
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validateAllowedField(["isBanned"]),
    validate,
    adminController.toggleUserBan
)

module.exports = router
