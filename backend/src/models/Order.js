const mongoose=require("mongoose")

const orderItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    productName:{
        type:String,
        required:true,
        trim:true
    },
    sellingPrice:{
        type:Number,
        required:true,
        min:0
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
},{_id:false})

const shippingAddressSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    phoneNo:{
        type:String,
        required:true,
        trim:true
    },
    houseNo:{
        type:String,
        required:true,
        trim:true
    },
    street:{
        type:String,
        required:true,
        trim:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    state:{
        type:String,
        required:true,
        trim:true
    },
    country:{
        type:String,
        required:true,
        trim:true
    },
    zipCode:{
        type:String,
        required:true,
        trim:true
    }

},{_id:false})

const orderSchema=new mongoose.Schema({

    orderNumber:{
        type:String,
        required:true,
        unique:true,
        immutable:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    items:{
        type:[orderItemSchema],
        required:true
    },

    shippingAddress:{
        type:shippingAddressSchema,
        required:true
    },

    totalPrice:{
        type:Number,
        required:true,
        min:0
    },

    paymentMethod:{
        type:String,
        enum:["COD","ONLINE"],
        required:true
    },

    paymentStatus:{
        type:String,
        enum:["PENDING","PAID","FAILED"],
        default:"PENDING"
    },

    orderStatus:{
        type:String,
        enum:[
            "PENDING",
            "PLACED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ],
        default:"PENDING"
    },

    cancelReason:{
        type:String,
        trim:true
    },

    cancelledAt:{
        type:Date
    },

    refundStatus:{
        type:String,
        enum:["NONE","PENDING","COMPLETED"],
        default:"NONE"
    },

    refundAmount:{
        type:Number,
        default:0,
        min:0
    },

    refundedAt:{
        type:Date
    },

    deliveredAt:{
        type:Date
    }

},{
    timestamps:true
})
orderSchema.set("toJSON",{
    transform:function(doc,ret){
        delete ret.__v
        return ret
    }
})
const OrderModel=mongoose.model("Order",orderSchema)

module.exports=OrderModel