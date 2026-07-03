const mongoose=require("mongoose")
const ReviewModel=require("../models/Review")
const ProductModel=require("../models/Product")
const OrderModel=require("../models/Order")
const ApiError=require("../utils/ApiErrors")

const createReview=async(reviewData,userData)=>{
    const {productId,rating,comment}=reviewData
    const product=await ProductModel.findOne({
        _id:productId,
        isActive:true
    })
    if(!product){
        throw new ApiError(404,"Product not found")
    }
    const hasPurchased=await OrderModel.exists({
        user:userData._id,
        "items.product":productId,
        orderStatus:"DELIVERED"
    })
    if(!hasPurchased){
        throw new ApiError(400,"You can only review products you have purchased")
    }
    const existingReview=await ReviewModel.findOne({
        user:userData._id,
        product:productId
    })
    if(existingReview){
        throw new ApiError(409,"You have already reviewed this product")
    }
    const review=await ReviewModel.create({
        user:userData._id,
        product:productId,
        rating,
        comment
    })
    await updateProductRating(productId)
    return review
}

const getProductReviews=async(productId)=>{
    const product=await ProductModel.findOne({
        _id:productId,
        isActive:true
    })
    if(!product){
        throw new ApiError(404,"Product not found")
    }
    const reviews=await ReviewModel.find({
        product:productId
    }).populate("user","name").sort({createdAt:-1})
    return reviews
}

const updateReview=async(reviewId,updateData,userData)=>{
    const review=await ReviewModel.findById(reviewId)
    if(!review){
        throw new ApiError(404,"Review not found")
    }
    if(review.user.toString()!==userData._id.toString()){
        throw new ApiError(403,"You are not allowed to update this review")
    }
    Object.assign(review,updateData)
    await review.save()
    await updateProductRating(review.product)
    return review
}

const deleteReview=async(reviewId,userData)=>{
    const review=await ReviewModel.findById(reviewId)
    if(!review){
        throw new ApiError(404,"Review not found")
    }
    if(userData.role!=="ADMIN"){
        if(review.user.toString()!==userData._id.toString()){
            throw new ApiError(403,"You are not allowed to delete this review")
        }
    }
    const productId=review.product
    await review.deleteOne()
    await updateProductRating(productId)
    return review
}

const updateProductRating=async(productId)=>{
    const result=await ReviewModel.aggregate([
        {$match:{product:new mongoose.Types.ObjectId(productId)}},
        {$group:{
            _id:"$product",
            averageRating:{$avg:"$rating"},
            totalReviews:{$sum:1}
        }}
    ])
    if(result.length>0){
        await ProductModel.findByIdAndUpdate(productId,{
            averageRating:Math.round(result[0].averageRating*10)/10,
            totalReviews:result[0].totalReviews
        })
    }
    else{
        await ProductModel.findByIdAndUpdate(productId,{
            averageRating:0,
            totalReviews:0
        })
    }
}

module.exports={
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
}
