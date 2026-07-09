const productService = require("../services/productService")

const createProduct = async (req, res) => {
    const product = await productService.createProduct(req.body, req.user.id)
    res.status(201).json({
        success: true,
        message: "product created succesfully",
        data: product
    })
}

const getAllProducts = async (req, res) => {
    const result = await productService.getAllProducts(req.query)
    return res.status(200).json({
        success: true,
        message: "products fetched succesfully",
        data: result,
    })
}
const getProductByid = async (req, res) => {
    const products = await productService.getProductByid(req.params.id)
    return res.status(200).json({
        success: true,
        message: "product fetched succesfully",
        data: products,
    })
}
const updateProduct = async (req, res) => {
    const products = await productService.updateProduct(req.params.id,req.body,req.user)
    return res.status(200).json({
        success: true,
        message: "product update succesfully",
        data: products,
    })
}
const deleteProduct = async (req, res) => {
    const products = await productService.deleteProduct(req.params.id,req.user)
    return res.status(200).json({
        success: true,
        message: "product deleted succesfully",
        data: products,
    })
}



const toggleProductActive = async (req, res) => {
    const product = await productService.toggleProductActive(req.params.id, req.user)
    return res.status(200).json({
        success: true,
        message: "product status updated succesfully",
        data: product,
    })
}

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductByid,
    toggleProductActive
}