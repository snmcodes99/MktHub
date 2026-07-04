import axiosClient from "./axiosClient"

export const processPayment = (data) => axiosClient.post("/payment/checkout", data)

export const getPaymentStatus = (orderId) => axiosClient.get(`/payment/status/${orderId}`)
