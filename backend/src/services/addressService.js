const AddressModel = require("../models/Address");
const ApiError=require("../utils/ApiErrors")

const createAddress=async(addressData,userData)=>{
    const {name,phoneNo,houseNo,street,city,state,country,zipCode,addressType,isDefault}=addressData
    const addressCount=await AddressModel.countDocuments({user:userData._id})
    let defaultAddress=isDefault
    if(addressCount>=5){
        throw new ApiError(400,"maxlimit of addresses is 5")
    }
    if(addressCount===0){
        defaultAddress=true
    }
    if(defaultAddress){
        await AddressModel.updateMany({user:userData._id,isDefault:true},{  isDefault:false})
    }
    const newAddress=await AddressModel.create({
        user:userData._id,
        name,
        phoneNo,
        houseNo,
        street,
        city,
        state,
        country,
        zipCode,
        addressType,
        isDefault:defaultAddress
    })
    return newAddress
}

const getMyAddresses=async(userData)=>{
    const addresses=await AddressModel.find({
        user:userData._id
    }).sort({isDefault:-1,createdAt:-1})
    return addresses
}

const updateAddress=async(addressId,addressData,userData)=>{
    const address=await AddressModel.findOne({
        _id:addressId,
        user:userData._id
    })
    if(!address){
        throw new ApiError(404,"Address not found")
    }
    if(address.isDefault&&addressData.isDefault===false){
        throw new ApiError(400,"Default address cannot be unset")
    }
    if(addressData.isDefault===true){
        await AddressModel.updateMany({
            user:userData._id,
            isDefault:true
        },{
            isDefault:false
        })
    }
    Object.assign(address,addressData)
    await address.save
    return address
}

const deleteAddress=async(addressId,userData)=>{
    const address=await AddressModel.findOne({
        _id:addressId,
        user:userData._id
    })
    if(!address){
        throw new ApiError(404,"Address not found")
    }
    const wasDefault=address.isDefault
    await address.deleteOne()
    if(wasDefault){
        const latestAddress=await AddressModel.findOne({
            user:userData._id
        }).sort({createdAt:-1})
        if(latestAddress){
            latestAddress.isDefault=true
            await latestAddress.save()
        }
    }
    return
}
const setDefaultAddress=async(addressId,userData)=>{
    const address=await AddressModel.findOne({
        _id:addressId,
        user:userData._id
    })
    if(!address){
        throw new ApiError(404,"Address not found")
    }
    if(address.isDefault){
        throw new ApiError(400,"Address is already default")
    }
    await AddressModel.updateMany(
        {
            user:userData._id,
            isDefault:true
        },
        {
            isDefault:false
        }
    )
    address.isDefault=true
    await address.save()
    return address
}
module.exports={
    createAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
}