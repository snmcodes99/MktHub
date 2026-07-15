const crypto = require("crypto")
const ApiError = require("../utils/ApiErrors")
const paymentService = require("../services/paymentService")
const { processSuccessfulRefund } = require("../services/refundService")
const handleRazorpayWebhook = async (req, res, next) => {
    try {
        const signature = req.headers["x-razorpay-signature"]

        if (!signature) {
            throw new ApiError(400, "Missing webhook signature")
        }

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_WEBHOOK_SECRET
            )
            .update(req.body)
            .digest("hex")

        if (expectedSignature !== signature) {
            throw new ApiError(400, "Invalid webhook signature")
        }

        const event = JSON.parse(req.body.toString())
        if (event.event === "payment.captured") {
            const paymentEntity = event.payload.payment.entity
            await paymentService.processSuccessfulPayment(paymentEntity)
        } else if (event.event === "refund.processed") {
            const refundEntity = event.payload.refund.entity
            await processSuccessfulRefund(refundEntity)
        }

        return res.status(200).json({
            success: true,
            message: "Webhook received"
        })
    } catch (error) {
        next(error)
    }
}
module.exports = { handleRazorpayWebhook }