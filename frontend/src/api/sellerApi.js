import axiosClient from "./axiosClient"

export const createSellerRequest = (data) => axiosClient.post("/seller-request", data)

export const getMySellerRequest = () => axiosClient.get("/seller-request/me")

export const getAllSellerRequests = (params) => axiosClient.get("/seller-request", { params })

export const approveSellerRequest = (id) => axiosClient.patch(`/seller-request/${id}/approve`)

export const rejectSellerRequest = (id, data) => axiosClient.patch(`/seller-request/${id}/reject`, data)

export const getDashboardStats = () => axiosClient.get("/seller/dashboard")

export const getSellerProducts = (params) => axiosClient.get("/seller/products", { params })
