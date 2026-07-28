class ApiError extends Error{
    constructor(statusCode,message,errors=null,errorCode=null){
        super(message)
        this.statusCode=statusCode
        this.errors=errors
        this.errorCode=errorCode
        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports=ApiError