import axiosClient from "./axiosClient"

export const processPayment = (data) => axiosClient.post("/payments/create", data)

export const getPaymentStatus = (orderId) => axiosClient.get(`/payments/status/${orderId}`)
