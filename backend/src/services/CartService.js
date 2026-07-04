const CartModel=require("../models/Cart")
const ProductModel=require("../models/Product")
const ApiError=require("../utils/ApiErrors")

const addToCart=async(productId,quantity,userData)=>{
    const product=await ProductModel.findOne({
        _id:productId,
        isActive:true
    })
    if(!product){
        throw new ApiError(404,"Product not found")
    }
    let cart=await CartModel.findOne({
        user:userData._id
    })
    if(!cart){
        if(quantity>product.stock){
            throw new ApiError(400,"Insufficient stock")
        }
        const newCart=await CartModel.create({
            user:userData._id,
            items:[
                {
                    product:productId,
                    quantity
                }
            ]
        })
        return newCart
    }
    const cartItem=cart.items.find((item)=>{
        return item.product.toString()===productId.toString()
    })
    if(cartItem){
        const totalQuantity=cartItem.quantity+quantity
        if(totalQuantity>product.stock){
            throw new ApiError(400,"Insufficient stock")
        }
        cartItem.quantity=totalQuantity
    }
    else{
        if(quantity>product.stock){
            throw new ApiError(400,"Insufficient stock")
        }
        cart.items.push({
            product:productId,
            quantity
        })
    }
    await cart.save()
    return cart
}

const getMyCart=async(userData)=>{
    const cart=await CartModel.findOne({
        user:userData._id
    }).populate({
        path:"items.product",
        select:"name slug sellingPrice stock images"
    })
    if(!cart){
        return{
            items:[],
            totalPrice:0,
            totalItems: 0
        }
    }
    let totalPrice=0
    cart.items.forEach((item)=>{
        totalPrice+=item.product.sellingPrice*item.quantity
    })
    return{
        _id: cart._id,
        items: cart.items,
        totalPrice,
        totalItems: cart.items.length
    }
}

const updateCartItem=async(productId,quantity,userData)=>{
    const product=await ProductModel.findOne({
        _id:productId,
        isActive:true
    })
    if(!product){
        throw new ApiError(404,"Product not found")
    }
    if(quantity>product.stock){
        throw new ApiError(400,"Insufficient stock")
    }
    const cart=await CartModel.findOne({
        user:userData._id
    })
    if(!cart){
        throw new ApiError(404,"Cart not found")
    }
    const cartItem=cart.items.find((item)=>{
        return item.product.toString()===productId.toString()
    })
    if(!cartItem){
        throw new ApiError(404,"Product not found in cart")
    }
    cartItem.quantity=quantity
    await cart.save()
    return cart
}

const removeCartItem=async(productId,userData)=>{
    const cart=await CartModel.findOne({
        user:userData._id
    })
    if(!cart){
        throw new ApiError(404,"Cart not found")
    }
    const cartItem=cart.items.find((item)=>{
        return item.product.toString()===productId.toString()
    })
    if(!cartItem){
        throw new ApiError(404,"Product not found in cart")
    }
    cart.items=cart.items.filter((item)=>{
        return item.product.toString()!==productId.toString()
    })
    await cart.save()
    return cart
}

module.exports={
    addToCart,
    getMyCart,
    updateCartItem,
    removeCartItem
}