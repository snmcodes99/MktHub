const ApiError = require("../../utils/ApiErrors");

const validateAllowedFields=(allowedFileds)=>{
    const helper=(req,res,next)=>{
        const allFeilds=Object.keys(req.body);
        const extraFields=allFeilds.filter(feilds=> !allowedFileds.includes(feilds))
        if(extraFields.length>0){
            console.log("VALIDATION ERROR: extra fields present.", extraFields);
            console.log("req.body is:", req.body);
            return next(new ApiError(400,"extra fields present",extraFields))
        }
        next()
    }
    return helper
}

module.exports=validateAllowedFields;