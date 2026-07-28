const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiErrors");
const SessionModel = require("../models/Session")
const { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry, generateSecureToken } = require("../utils/tokenUtils");
const emailQueue = require("../jobs/email/emailQueue");


const registerSerice = async (data) => {
    const { name, email } = data;
    const isUser = await UserModel.findOne({ email });
    if (isUser) {
        throw new ApiError(409, "email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = generateSecureToken()
    const verificationTokenHash = hashToken(verificationToken)

    const userData = {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpires: new Date(
            Date.now() + 24 * 60 * 60 * 1000
        )
    }
    const user = await UserModel.create(userData);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
    try {
        await emailQueue.add(
            "send-verification-email",
            {
                email,
                verificationUrl
            }
        )
    } catch (error) {
        console.error(
            "Unable to send verification email:",
            error.message
        )
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashToken(refreshToken)
    await SessionModel.create({
        user: user._id,
        refreshTokenHash,
        expiresAt: getRefreshTokenExpiry()
    })

    return {
        user,
        accessToken,
        refreshToken
    }
};

const loginService = async (data) => {
    const { email, password } = data;
    const user = await UserModel.findOne({ email }).select("+password +pendingEmail");
    if (!user) {
        throw new ApiError(401, "Invalid Credentials");
    }
    const hashedpassword = user.password;
    const isMatch = await bcrypt.compare(password, hashedpassword);
    if (!isMatch) {
        throw new ApiError(401, "Invalid Credentials");
    }
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashToken(refreshToken)
    await SessionModel.create({
        user: user._id,
        refreshTokenHash,
        expiresAt: getRefreshTokenExpiry()
    })
    return {
        user,
        accessToken,
        refreshToken
    };
};

const refreshSession = async (oldRefreshToken) => {
    if (!oldRefreshToken) {
        throw new ApiError(401, "Refresh Token is required")
    }
    const oldRefreshTokenHash = hashToken(oldRefreshToken)

    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHash = hashToken(newRefreshToken)
    const session = await SessionModel.findOneAndUpdate(
        {
            refreshTokenHash: oldRefreshTokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() }
        },
        {
            $set: {
                refreshTokenHash: newRefreshTokenHash
            }
        },
        {
            returnDocument: "after"
        }
    )

    if (!session) {
        throw new ApiError(401, "Invalid or Expired refresh token")
    }

    const accessToken = generateAccessToken(session.user)

    return {
        accessToken,
        refreshToken: newRefreshToken
    }
}
const getCurrentUser = async (userData) => {
    const user = await UserModel.findById(userData._id).select("+pendingEmail")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return user
}

const changePassword = async (userData, passwordData) => {
    const { currentPassword, newPassword } = passwordData
    const user = await UserModel.findById(userData._id).select("+password")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect")
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    await SessionModel.updateMany(
        {
            user: user._id,
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date()
            }
        }
    )
    return
}

const updateProfile = async (userData, updateData) => {
    const { name, email } = updateData

    let emailUpdateData = {}

    if (email && email !== userData.email) {
        const existingUser = await UserModel.findOne({ email })
        if (existingUser && existingUser._id.toString() !== userData._id.toString()) {
            throw new ApiError(409, "Email is already in use by another account")
        }

        const verificationToken = generateSecureToken()
        const verificationTokenHash = hashToken(verificationToken)

        emailUpdateData = {
            pendingEmail: email,
            emailChangeToken: verificationTokenHash,
            emailChangeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email-change/${verificationToken}`
        try {
            await emailQueue.add(
                "send-email-change-verification",
                {
                    email,
                    verificationUrl
                }
            )
        } catch (error) {
            console.error("Unable to send email change verification email:", error.message)
        }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
        userData._id,
        {
            ...(name && { name }),
            ...emailUpdateData
        },
        { returnDocument: "after", runValidators: true }
    ).select("+pendingEmail")

    if (!updatedUser) {
        throw new ApiError(404, "User not found")
    }

    return updatedUser
}

const logout = async (refreshToken) => {
    if (!refreshToken) {
        return
    }
    const refreshTokenHash = hashToken(refreshToken)
    await SessionModel.findOneAndUpdate(
        {
            refreshTokenHash,
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date()
            }
        }
    )
}

const logoutAllDevices = async (userId) => {
    await SessionModel.updateMany(
        {
            user: userId,
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date()
            }
        }
    )
}

const forgotPassword = async (email) => {
    const user = await UserModel.findOne({ email })
    if (!user) {
        return
    }
    const resetToken = generateSecureToken()
    const resetTokenHash = hashToken(resetToken)
    user.passwordResetToken = resetTokenHash
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    try {
        await emailQueue.add(
            "forgot-password",
            {
                email: user.email,
                resetUrl
            }
        )
    }
    catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()
        throw new ApiError(500, "Unable to send password reset email")
    }
}

const resetPassword = async (rawToken, newPassword) => {
    const resetTokenHash = hashToken(rawToken)
    const user = await UserModel.findOneAndUpdate(
        {
            passwordResetToken: resetTokenHash,
            passwordResetExpires: { $gt: new Date() }
        },
        {
            $unset: {
                passwordResetToken: 1,
                passwordResetExpires: 1
            }
        },
        {
            returnDocument: "after"
        }
    ).select("+password")
    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token")
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    await SessionModel.updateMany(
        {
            user: user._id,
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date()
            }
        }
    )
}
const verifyEmail = async (rawToken) => {
    const verificationTokenHash = hashToken(rawToken)
    const user = await UserModel.findOneAndUpdate(
        {
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: { $gt: new Date() }
        },
        {
            $set: {
                isEmailVerified: true
            }
        },
        {
            returnDocument: "after"
        }
    )
    if (!user) {
        throw new ApiError(400, "Invalid or expired email verification token")
    }
    return user
}

const resendVerificationEmail = async (email) => {
    const COOLDOWN_MS = 15 * 1000
    const now = new Date()
    const cooldownThreshold = new Date(Date.now() - COOLDOWN_MS)

    const verificationToken = generateSecureToken()
    const verificationTokenHash = hashToken(verificationToken)

    const user = await UserModel.findOneAndUpdate(
        {
            email,
            isEmailVerified: false,
            $or: [
                {
                    lastVerificationEmailSentAt: {
                        $exists: false
                    }
                },
                {
                    lastVerificationEmailSentAt: {
                        $lt: cooldownThreshold
                    }
                }
            ]
        },
        {
            $set: {
                emailVerificationToken: verificationTokenHash,
                emailVerificationExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ),
                lastVerificationEmailSentAt: now
            }
        },
        {
            returnDocument: "after"
        }
    )

    if (!user) {
        return
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`

    try {
        await emailQueue.add(
            "send-verification-email",
            {
                email: user.email,
                verificationUrl
            }
        )
    }
    catch (error) {
        throw new ApiError(
            500,
            "Unable to queue verification email"
        )
    }
}
const verifyEmailChange = async (rawToken) => {
    const verificationTokenHash = hashToken(rawToken)
    const user = await UserModel.findOne({
        emailChangeToken: verificationTokenHash,
        emailChangeExpires: { $gt: new Date() }
    }).select("+pendingEmail +emailChangeToken +emailChangeExpires")

    if (!user || !user.pendingEmail) {
        throw new ApiError(400, "Invalid or expired email change token")
    }

    // Double check email is not taken by someone else right before saving
    const existingUser = await UserModel.findOne({ email: user.pendingEmail })
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        throw new ApiError(409, "The requested email is already in use by another account")
    }

    user.email = user.pendingEmail
    user.isEmailVerified = true
    user.pendingEmail = undefined
    user.emailChangeToken = undefined
    user.emailChangeExpires = undefined
    
    await user.save()
    return user
}

const resendEmailChange = async (userId) => {
    const COOLDOWN_MS = 15 * 1000
    const now = new Date()
    const cooldownThreshold = new Date(Date.now() - COOLDOWN_MS)

    const user = await UserModel.findById(userId).select("+pendingEmail +lastEmailChangeSentAt")
    if (!user || !user.pendingEmail) {
        throw new ApiError(400, "No pending email change request found")
    }

    if (user.lastEmailChangeSentAt && user.lastEmailChangeSentAt > cooldownThreshold) {
        // Enforce cooldown quietly or explicitly (we'll just return quietly like before, or we can throw)
        return
    }

    const verificationToken = generateSecureToken()
    const verificationTokenHash = hashToken(verificationToken)

    user.emailChangeToken = verificationTokenHash
    user.emailChangeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    user.lastEmailChangeSentAt = now

    await user.save()

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email-change/${verificationToken}`

    try {
        await emailQueue.add(
            "send-email-change-verification",
            {
                email: user.pendingEmail,
                verificationUrl
            }
        )
    }
    catch (error) {
        throw new ApiError(500, "Unable to queue email change verification email")
    }
}

module.exports = {
    registerSerice,
    loginService,
    getCurrentUser,
    changePassword,
    updateProfile,
    logout,
    refreshSession,
    logoutAllDevices,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    verifyEmailChange,
    resendEmailChange
}
