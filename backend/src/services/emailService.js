const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"MkttHub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
}
const sendVerificationEmail = async (email, verificationUrl) => {
    return sendEmail({
        to: email,
        subject: "Verify your MktHub email",
        html: `
            <h2>Welcome to MktHub</h2>
            <p>Please verify your email address before logging in.</p>
            <p>This link expires in 24 hours.</p>
            <a href="${verificationUrl}">Verify Email</a>
        `
    })
}

const sendPasswordResetEmail = async (email, resetUrl) => {
    return sendEmail({
        to: email,
        subject: "Reset your MktHub password",
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset.</p>
            <p>This link expires in 15 minutes.</p>
            <a href="${resetUrl}">Reset Password</a>
        `
    })
}
module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
}