const mongoose=require("mongoose")

const reviewSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Products",
        required:true
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    comment:{
        type:String,
        required:true,
        trim:true
    }
},{
    timestamps:true
})

reviewSchema.index(
    {user:1,product:1},
    {unique:true}
)

reviewSchema.set("toJSON",{
    transform:function(doc,ret){
        delete ret.__v
        return ret
    }
})

const ReviewModel=mongoose.model("Review",reviewSchema)

module.exports=ReviewModel
