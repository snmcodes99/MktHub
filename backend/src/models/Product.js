const mongoose=require("mongoose");

const ProductScheme=new mongoose.Schema({
    name:{
        required:true,
        type:String,
        trim:true

    },
    description:{
        required:true,
        type:String,
        trim:true
    },
    slug:{ 
        type:String,
        required: true,
        lowercase: true,
        trim: true,
    },
    brand:{
        required:true,
        type:String,
        trim:true   
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Category"
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    mrp:{
        type:Number,
        required:true,
        min:[0,'Price cannot be negative']
    },
    sellingPrice:{
        type:Number,
        required:true,
        min:[0,'Price cannot be negative']
    },
    stock:{
        type:Number,
        required:true,
        min:[0,'Stock can not be negative'],
    },
    averageRating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
    totalReviews:{
        type:Number,
        min:[0,'Review cant be neagatie'],
        default:0
    },
    images:{
        type:[String],
        default:[]
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps: true
}
)
ProductScheme.index(
    {seller:1,slug: 1 },
    {unique:true }
);
// Indexes for performance optimization, especially for the Seller Dashboard aggregations
ProductScheme.index({ seller: 1, isActive: 1 }); // Efficient lookup of seller's active products
ProductScheme.index({ seller: 1, createdAt: -1 }); // Fast sorting of seller's recent products
ProductScheme.set("toJSON",{
    transform:(doc,ret)=>{
        delete ret.__v;
        return ret
    }
})

const ProductModel=mongoose.model("Products",ProductScheme)

module.exports=ProductModel