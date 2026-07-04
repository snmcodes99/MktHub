import axiosClient from "./axiosClient"

export const getDashboardStats = () => axiosClient.get("/admin/dashboard")
export const getAllUsers = () => axiosClient.get("/admin/users")
export const updateUserRole = (id, role) => axiosClient.patch(`/admin/users/${id}/role`, { role })
export const toggleUserBan = (id, isBanned) => axiosClient.patch(`/admin/users/${id}/ban`, { isBanned })
