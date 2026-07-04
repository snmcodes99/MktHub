const authService=require("../services/authService")

const register=async(req,res)=>{
    const data=req.body;
    const { user, token }=await authService.registerSerice(data);
    res.status(201).json({
        success:true,
        message:"User Created Succesfully",
        data: { token, user }
    })
}
const login=async(req,res)=>{
    const data=req.body;
    const cred=await authService.loginService(data)
    const {token,user}=cred
    res.status(200).json({
        success:true,
        message:"login successful",
        data: { token, user }
    })
}

const getCurrentUser=async(req,res)=>{
    const user=await authService.getCurrentUser(req.user)
    res.status(200).json({
        success:true,
        message:"User fetched successfully",
        data:user
    })
}

const changePassword=async(req,res)=>{
    await authService.changePassword(req.user,req.body)
    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
}
const updateProfile=async(req,res)=>{
    const updatedUser = await authService.updateProfile(req.user, req.body)
    res.status(200).json({
        success:true,
        message:"Profile updated successfully",
        data: updatedUser
    })
}

const logout=async(req,res)=>{
    await authService.logout()
    res.status(200).json({
        success:true,
        message:"Logged out successfully"
    })
}
module.exports={register,login,getCurrentUser,changePassword,updateProfile,logout}