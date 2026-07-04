const express = require("express")
const adminController = require("../controllers/adminController")
const authMiddleware = require("../middleware/auth/authMiddleware")
const authorize = require("../middleware/auth/authorize")
const { mongoIdValidation } = require("../middleware/validation/commonValidation")
const validateAllowedField = require("../middleware/validation/validateAllowedField")
const validate = require("../middleware/validation/validate")
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
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validateAllowedField(["role"]),
    validate,
    adminController.updateUserRole
)

router.patch("/users/:id/ban",
    authMiddleware,
    authorize("ADMIN"),
    mongoIdValidation("id"),
    validateAllowedField(["isBanned"]),
    validate,
    adminController.toggleUserBan
)

module.exports = router
