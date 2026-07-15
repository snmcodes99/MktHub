const sellerRequestService = require("../services/sellerRequestService");

const createSellerRequest = async (req, res) => {
    const sellerReq = await sellerRequestService.createSellerRequest(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "create a seller request",
        data: sellerReq
    })
}

const getMySellerRequest = async (req, res) => {
    const sellerReq = await sellerRequestService.getMySellerRequests(req.user);
    res.status(200).json({
        success: true,
        message: "Seller request fetched successfully",
        data: sellerReq
    })
}

const getAllSellerRequests = async (req, res) => {
    const result = await sellerRequestService.getAllSellerRequests(req.query);
    res.status(200).json({
        success: true,
        message: "Seller requests fetched successfully",
        data: result
    })
}

const approveSellerRequest = async (req, res) => {
    const sellerRequest = await sellerRequestService.approveSellerRequest(req.params.id, req.user)
    res.status(200).json({
        success: true,
        message: "Seller request approved successfully",
        data: sellerRequest
    })
}

const rejectSellerRequest = async (req, res) => {
    const sellerRequest = await sellerRequestService.rejectSellerRequest(req.params.id, req.user, req.body.rejectionReason
    )
    res.status(200).json({
        success: true,
        message: "Seller request rejected successfully",
        data: sellerRequest
    })
}

module.exports = { createSellerRequest, getMySellerRequest, getAllSellerRequests, approveSellerRequest, rejectSellerRequest }