const paymentService = require("../services/paymentService")

const processPayment = async (req, res) => {

    const { orderId, status } = req.body

    const result = await paymentService.processPayment(
        orderId,
        { status },
        req.user
    )

    res.status(200).json({
        success: result.payment.status === "SUCCESS",
        message: result.payment.message,
        data: result
    })

}

const getPaymentStatus = async (req, res) => {

    const payment = await paymentService.getPaymentStatus(
        req.params.orderId,
        req.user
    )

    res.status(200).json({
        success: true,
        message: "Payment status fetched successfully",
        data: payment
    })

}

module.exports = {
    processPayment,
    getPaymentStatus
}