import axiosClient from "./axiosClient"

export const getCart = () => axiosClient.get("/cart")

export const addToCart = (data) => axiosClient.post("/cart", data)

export const updateCartItem = (id, data) => axiosClient.patch(`/cart/${id}`, data)

export const removeCartItem = (id) => axiosClient.delete(`/cart/${id}`)
