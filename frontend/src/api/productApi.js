import axiosClient from "./axiosClient"

export const getProducts = (params) => axiosClient.get("/product", { params })

export const getProductById = (id) => axiosClient.get(`/product/${id}`)

export const createProduct = (data) => axiosClient.post("/product", data)

export const updateProduct = (id, data) => axiosClient.patch(`/product/${id}`, data)

export const deleteProduct = (id) => axiosClient.delete(`/product/${id}`)

export const toggleProductActive = (id) => axiosClient.patch(`/product/${id}/toggle-active`)
