const mongoose = require("mongoose")
const ReservationModel = require("../models/Reservation")
const { reserveInventory } = require("./inventoryService")

const { getOrderItems, getShippingAddress, validateProducts } = require("./order/orderHelper")

const createReservation = async (checkoutData, userData) => {
    const checkoutItems = await getOrderItems(checkoutData, userData)
    const address = await getShippingAddress(checkoutData.addressId, userData)
    const { orderProductSnapshot, totalPrice } = await validateProducts(checkoutItems)
    const session=await mongoose.startSession()
    try{
        session.startTransaction()
        await reserveInventory(orderProductSnapshot,session)
        const expiresAt=new Date(Date.now()+15*60*1000)
        const [reservation]=await ReservationModel.create(
            [
                {
                    user:userData._id,
                    items:orderProductSnapshot,
                    shippingAddress: {
                        name: address.name,
                        phoneNo: address.phoneNo,
                        houseNo: address.houseNo,
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        zipCode: address.zipCode
                    },
                    source: checkoutData.source,
                    totalAmount: totalPrice,
                    status: "PENDING",
                    expiresAt
                }
            ],{
                session
            }
        )
        await session.commitTransaction()
        return reservation
    }
    catch(error){
            await session.abortTransaction()
            throw error
    }
    finally{
        await session.endSession()
    }
}



module.exports={
    createReservation
}