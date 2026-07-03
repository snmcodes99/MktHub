const addressService=require("../services/addressService")

const createAddress=async(req,res)=>{
    const newAddress=await addressService.createAddress(req.body,req.user)
    res.status(201).json({
        success:true,
        message:"Address saved successfully",
        data:newAddress,
    })
}
const getMyAddresses=async(req,res)=>{
    const addresses=await addressService.getMyAddresses(req.user)
    res.status(200).json({
        success:true,
        message:"Addresses fetched successfully",
        data:addresses
    })
}
const updateAddress=async(req,res)=>{
    const address=await addressService.updateAddress(req.params.id,req.body,req.user)
    res.status(200).json({
        success:true,
        message:"Address updated successfully",
        data:address
    })
}
const deleteAddress=async(req,res)=>{
    await addressService.deleteAddress(req.params.id,req.user)
    res.status(200).json({
        success:true,
        message:"Address deleted successfully"
    })
}
const setDefaultAddress=async(req,res)=>{
    const address=await addressService.setDefaultAddress(
        req.params.id,
        req.user
    )
    res.status(200).json({
        success:true,
        message:"Default address updated successfully",
        data:address
    })
}
module.exports={
    createAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
}