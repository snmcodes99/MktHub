const ApiError=require("../../utils/ApiErrors");

const errorMiddleware=(err,req,res,next)=>{
    console.log(err);
    if(err instanceof ApiError){
        const response={
            success:false,
            message:err.message
        }
        if(err.errors){
            response.errors=err.errors
        }
        if(err.errorCode){
            response.errorCode=err.errorCode
        }
        return res.status(err.statusCode).json(response)
    }
    if(err.code===11000){
        return res.status(409).json({
            success:false,
            message:"Duplicate Resource"
        })
    }
    return res.status(500).json({
        success:false,
        message:"internal server error"
    })
}

module.exports=errorMiddleware