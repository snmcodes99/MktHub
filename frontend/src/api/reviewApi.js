import axiosClient from "./axiosClient"

export const createReview = (data) => axiosClient.post("/review", data)

export const getProductReviews = (productId) => axiosClient.get(`/review/product/${productId}`)

export const updateReview = (id, data) => axiosClient.patch(`/review/${id}`, data)

export const deleteReview = (id) => axiosClient.delete(`/review/${id}`)
