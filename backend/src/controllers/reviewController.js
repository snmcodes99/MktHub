const reviewService=require("../services/reviewService")

const createReview=async(req,res)=>{
    const review=await reviewService.createReview(req.body,req.user)
    res.status(201).json({
        success:true,
        message:"Review created successfully",
        data:review
    })
}

const getProductReviews=async(req,res)=>{
    const reviews=await reviewService.getProductReviews(req.params.productId)
    res.status(200).json({
        success:true,
        message:"Reviews fetched successfully",
        data:reviews
    })
}

const updateReview=async(req,res)=>{
    const review=await reviewService.updateReview(req.params.id,req.body,req.user)
    res.status(200).json({
        success:true,
        message:"Review updated successfully",
        data:review
    })
}

const deleteReview=async(req,res)=>{
    const review=await reviewService.deleteReview(req.params.id,req.user)
    res.status(200).json({
        success:true,
        message:"Review deleted successfully",
        data:review
    })
}

module.exports={
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
}
