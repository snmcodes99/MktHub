const paymentService = require("../services/paymentService")

const createPayment = async (req, res) => {
    const result = await paymentService.createPayment(req.body,req.user)
    res.status(201).json({
        success: true,
        message: "Payment initiated successfully",
        data: result
    })
}

module.exports = {
    createPayment
}