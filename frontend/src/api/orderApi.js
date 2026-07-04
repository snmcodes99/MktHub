import axiosClient from "./axiosClient"

export const placeOrder = (data) => axiosClient.post("/order", data)

export const getMyOrders = () => axiosClient.get("/order/my-orders")

export const getOrderById = (id) => axiosClient.get(`/order/${id}`)

export const cancelOrder = (id) => axiosClient.patch(`/order/${id}/cancel`)

export const returnOrder = (id) => axiosClient.patch(`/order/${id}/return`)

export const getAllOrders = () => axiosClient.get("/order")

export const updateOrderStatus = (id, data) => axiosClient.patch(`/order/${id}/status`, data)

export const getSellerOrders = () => axiosClient.get("/order/seller/orders")
