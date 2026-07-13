import axiosClient from "./axiosClient"

export const placeOrder = (data) => axiosClient.post("/order", data)

export const getMyOrders = () => axiosClient.get("/order/my-orders")

export const getOrderById = (id) => axiosClient.get(`/order/${id}`)

export const cancelOrder = ({ id, reason }) => axiosClient.patch(`/order/${id}/cancel`, { reason })

export const returnOrder = (id) => axiosClient.patch(`/order/${id}/return`)

export const getAllOrders = (params) => axiosClient.get("/order", { params })

export const updateOrderStatus = (id, data) => axiosClient.patch(`/order/${id}/status`, data)

export const getSellerOrders = (params) => axiosClient.get("/order/seller/orders", { params })
