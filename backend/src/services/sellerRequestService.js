const sellerRequestModel = require("../models/sellerRequest")
const UserModel = require("../models/User")
const ApiError = require("../utils/ApiErrors")

const createSellerRequest = async (requestData, userData) => {
    const { shopName, businessDescription, businessAddress, documents } = requestData
    if (userData.isBanned) {
        throw new ApiError(403, "You have been banned from selling on this platform.")
    }
    const requestPending = await sellerRequestModel.exists({
        user: userData._id,
        status: "PENDING"
    })
    if (requestPending) {
        throw new ApiError(409, "Request is already in pending")
    }
    const newSellerRequest = await sellerRequestModel.create({
        user: userData._id,
        shopName, businessDescription, businessAddress, documents
    })
    return newSellerRequest
}

const getMySellerRequests = async (userData) => {
    const sellerRequests = await sellerRequestModel.find({
        user: userData._id
    }).sort({ createdAt: -1 }).populate("reviewedBy", "name")
    return sellerRequests
}

const getAllSellerRequests = async () => {
    const sellerRequestData = await sellerRequestModel.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .populate("reviewedBy", "name")
    return sellerRequestData
}

const approveSellerRequest = async (requestId, adminData) => {
    const sellerRequest = await sellerRequestModel.findById(requestId)
    if (!sellerRequest) {
        throw new ApiError(404, "Seller request not found")
    }
    if (sellerRequest.status !== "PENDING") {
        throw new ApiError(400, "Seller request already processed")
    }
    sellerRequest.status = "APPROVED"
    sellerRequest.reviewedBy = adminData._id
    sellerRequest.reviewedAt = new Date()
    await sellerRequest.save()
    await UserModel.findByIdAndUpdate(
        sellerRequest.user,
        {role: "SELLER"}
    )
    return sellerRequest
}

const rejectSellerRequest=async(requestId,adminData,rejectionReason)=>{
    const sellerRequest=await sellerRequestModel.findById(requestId)
    if(!sellerRequest){
        throw new ApiError(404,"Seller request not found")
    }
    if(sellerRequest.status!=="PENDING"){
        throw new ApiError(400,"Seller request has already been processed")
    }
    sellerRequest.status="REJECTED"
    sellerRequest.reviewedBy=adminData._id
    sellerRequest.reviewedAt=new Date()
    sellerRequest.rejectionReason=rejectionReason
    await sellerRequest.save()
    return sellerRequest
}

module.exports = { createSellerRequest, getMySellerRequests, getAllSellerRequests, approveSellerRequest, rejectSellerRequest}