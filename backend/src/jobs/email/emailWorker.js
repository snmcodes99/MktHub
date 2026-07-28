const { Worker, redisConnection } = require("../shared/bull")
const { sendVerificationEmail, sendPasswordResetEmail, sendEmailChangeVerificationEmail } = require("../../services/emailService")

const emailWorker = new Worker(
    "email",
    async (job) => {
        if (job.name === "send-verification-email") {
            const { email, verificationUrl } = job.data
            await sendVerificationEmail(
                email,
                verificationUrl
            )
        }
        else if (job.name === "forgot-password") {
            const { email, resetUrl } = job.data

            await sendPasswordResetEmail(
                email,
                resetUrl
            )
        }
        else if (job.name === "send-email-change-verification") {
            const { email, verificationUrl } = job.data
            await sendEmailChangeVerificationEmail(
                email,
                verificationUrl
            )
        }

    },
    {
        connection: redisConnection
    }
)

module.exports = emailWorker