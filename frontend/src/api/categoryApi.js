import axiosClient from "./axiosClient"

export const getCategories = () => axiosClient.get("/category")

export const createCategory = (data) => axiosClient.post("/category", data)

export const updateCategory = (id, data) => axiosClient.patch(`/category/${id}`, data)

export const deleteCategory = (id) => axiosClient.delete(`/category/${id}`)
