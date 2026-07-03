const orderService=require("../services/order/orderService")

const placeOrder=async(req,res)=>{
    const newOrder=await orderService.placeOrder(req.body,
        req.user
    )
    res.status(201).json({
        success:true,
        message:"Order placed ",
        data:newOrder
    })
}

const getMyOrders=async(req,res)=>{
    const orders=await orderService.getMyOrders(req.user)
    res.status(200).json({
        success:true,
        message:"Orders fetched successfully",
        data:orders
    })
}

const getOrderById=async(req,res)=>{
    const order=await orderService.getOrderById(req.params.id,req.user)
    res.status(200).json({
        success:true,
        message:"Order fetched successfully",
        data:order
    })
}

const cancelOrder=async(req,res)=>{
    const order=await orderService.cancelOrder(req.params.id,req.user)
    res.status(200).json({
        success:true,
        message:"Order cancelled successfully",
        data:order
    })
}

const getAllOrders=async(req,res)=>{
    const orders=await orderService.getAllOrders()
    res.status(200).json({
        success:true,
        message:"Orders fetched successfully",
        data:orders
    })
}

const updateOrderStatus=async(req,res)=>{
    const order=await orderService.updateOrderStatus(req.params.id,req.body.status)
    res.status(200).json({
        success:true,
        message:"Order status updated successfully",
        data:order
    })
}

module.exports={
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
}