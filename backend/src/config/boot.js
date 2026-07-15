const User=require("../models/User")
const bcrypt=require("bcrypt");

const boot=async()=>{
    const adminexists=await User.findOne({role:"ADMIN"})
    if(adminexists){
        if (!adminexists.isEmailVerified) {
            adminexists.isEmailVerified = true
            await adminexists.save()
            console.log("admin email verification fixed")
        }
        console.log("admin already exist")
        return 
    }
    const hashedpassword=await bcrypt.hash(
        process.env.ADMIN_PASSWORD,10
    )
    await User.create({
        name:process.env.ADMIN_NAME,
        email:process.env.ADMIN_EMAIL,
        password:hashedpassword,
        role:"ADMIN",
        isEmailVerified: true
    })
    console.log("default admin created")
}
module.exports=boot