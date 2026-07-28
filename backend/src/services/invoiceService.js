const OrderModel = require("../models/Order");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const { sendEmail } = require("./emailService");

const generateAndSendInvoice = async (orderId) => {

    const order = await OrderModel.findById(orderId)
        .populate("user", "name email phone");

    if (!order) {
        throw new Error("Order not found");
    }

    const pdfBuffer = await generateInvoicePDF(order);

    await sendEmail({
        to: order.user.email,
        subject: `Invoice - ${order.orderNumber}`,
        html: `
            <h2>Thank you for shopping with MktHub!</h2>

            <p>Hi ${order.user.name},</p>

            <p>Your order has been placed successfully.</p>

            <p>Please find your invoice attached.</p>

            <p><strong>Order Number:</strong> ${order.orderNumber}</p>

            <p>Thank you for shopping with us.</p>
        `,
        attachments: [
            {
                filename: `Invoice-${order.orderNumber}.pdf`,
                content: pdfBuffer
            }
        ]
    });

};

module.exports = {
    generateAndSendInvoice
};