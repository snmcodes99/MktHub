const express = require("express")
const webhookController = require("../controllers/webhookController")

const router = express.Router()

router.post(
    "/razorpay",
    express.raw({ type: "application/json" }),
    webhookController.handleRazorpayWebhook
)

module.exports = router