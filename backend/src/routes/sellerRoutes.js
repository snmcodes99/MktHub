const express = require("express");
const sellerController = require("../controllers/sellerController");
const authMiddleware = require("../middleware/auth/authMiddleware");
const authorize = require("../middleware/auth/authorize");
const router = express.Router();

router.get("/dashboard",
    authMiddleware,
    authorize("SELLER", "ADMIN"),
    sellerController.getDashboard
);

module.exports = router;
