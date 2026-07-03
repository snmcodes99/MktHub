const express = require("express")
const adminController = require("../controllers/adminController")
const authMiddleware = require("../middleware/auth/authMiddleware")
const authorize = require("../middleware/auth/authorize")
const router = express.Router()

router.get("/dashboard",
    authMiddleware,
    authorize("ADMIN"),
    adminController.getDashboardStats
)

module.exports = router
