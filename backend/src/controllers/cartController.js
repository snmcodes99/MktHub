const cartService=require("../services/CartService")

const addToCart=async(req,res)=>{
    const {productId,quantity}=req.body
    const cart=await cartService.addToCart(productId,quantity,req.user)
    res.status(201).json({
        success:true,
        message:"Product added to cart successfully",
        data:cart
    })
}

const getMyCart=async(req,res)=>{
    const cart=await cartService.getMyCart(req.user)
    res.status(200).json({
        success:true,
        message:"Your cart",
        data:cart
    })
}

const updateCartItem=async(req,res)=>{
    const {id}=req.params
    const {quantity}=req.body
    const cart=await cartService.updateCartItem(id,quantity,req.user)
    res.status(200).json({
        success:true,
        message:"Cart updated successfully",
        data:cart
    })
}

const removeCartItem=async(req,res)=>{
    const cart=await cartService.removeCartItem(req.params.id,req.user)
    res.status(200).json({
        success:true,
        message:"Product removed from cart successfully",
        data:cart
    })
}

module.exports={
    addToCart,
    getMyCart,
    updateCartItem,
    removeCartItem
}