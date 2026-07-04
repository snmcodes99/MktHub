import axiosClient from "./axiosClient"

export const register = (data) => axiosClient.post("/auth/register", data)

export const login = (data) => axiosClient.post("/auth/login", data)

export const getCurrentUser = () => axiosClient.get("/auth/me")

export const changePassword = (data) => axiosClient.patch("/auth/change-password", data)

export const updateProfile = (data) => axiosClient.patch("/auth/profile", data)

export const logout = () => axiosClient.post("/auth/logout")
