import axiosClient from "./axiosClient"

export const register = (data) => axiosClient.post("/auth/register", data)

export const login = (data) => axiosClient.post("/auth/login", data)

export const getCurrentUser = () => axiosClient.get("/auth/me")

export const refreshToken = () => axiosClient.post("/auth/refresh")

export const changePassword = (data) => axiosClient.patch("/auth/change-password", data)

// Backend only allows updating `name`. Email is immutable.
export const updateProfile = (data) => axiosClient.patch("/auth/update-profile", data)

export const logout = () => axiosClient.post("/auth/logout")

export const logoutAllDevices = () => axiosClient.post("/auth/logout-all")

export const forgotPassword = (data) => axiosClient.post("/auth/forgot-password", data)

export const resetPassword = (token, data) => axiosClient.post(`/auth/reset-password/${token}`, data)

export const verifyEmail = (token) => axiosClient.get(`/auth/verify-email/${token}`)

export const resendVerificationEmail = (data) => axiosClient.post("/auth/resend-verification", data)
