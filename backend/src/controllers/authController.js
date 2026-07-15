const authService = require("../services/authService");
const { getRefreshCookieOptions } = require("../utils/tokenUtils");

const register = async (req, res) => {
    const data = req.body;
    const { user } = await authService.registerSerice(data);
    res.status(201).json({
        success: true,
        message: "User Created Succesfully",
        data: { user }
    })
}

const login = async (req, res) => {
    const data = req.body;
    const { user, accessToken, refreshToken } = await authService.loginService(data)
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions())
    res.status(200).json({
        success: true,
        message: "Login Succesfully",
        data: { accessToken, user }
    })
}

const refresh = async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken
    const { accessToken, refreshToken } = await authService.refreshSession(oldRefreshToken)
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions())
    res.status(200).json({
        success: true,
        message: "Token refreshed successfuly",
        data: {
            accessToken
        }
    })
}

const getCurrentUser = async (req, res) => {
    const user = await authService.getCurrentUser(req.user)
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user
    })
}

const changePassword = async (req, res) => {
    await authService.changePassword(req.user, req.body)
    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })
}
const updateProfile = async (req, res) => {
    const updatedUser = await authService.updateProfile(req.user, req.body)
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser
    })
}

const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    await authService.logout(refreshToken)
    res.clearCookie("refreshToken", getRefreshCookieOptions())

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}
const logoutAllDevices = async (req, res) => {
    await authService.logoutAllDevices(req.user._id)

    res.clearCookie("refreshToken", getRefreshCookieOptions())
    res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully"
    })
}
const forgotPassword = async (req, res) => {
    const { email } = req.body
    await authService.forgotPassword(email)

    res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
    })
}
const resetPassword = async (req, res) => {
    const { token } = req.params
    const { newPassword } = req.body

    await authService.resetPassword(token, newPassword)

    res.status(200).json({
        success: true,
        message: "Password reset successfully. Please login again."
    })
}
const verifyEmail = async (req, res) => {
    const { token } = req.params

    await authService.verifyEmail(token)

    res.status(200).json({
        success: true,
        message: "Email verified successfully. You can now log in."
    })
}
const resendVerificationEmail = async (req, res) => {
    const { email } = req.body

    await authService.resendVerificationEmail(email)

    res.status(200).json({
        success: true,
        message: "If the account exists and requires verification, a new verification email has been sent."
    })
}
module.exports = {
    register,
    login,
    getCurrentUser,
    changePassword,
    updateProfile,
    logout,
    refresh,
    logoutAllDevices,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
}