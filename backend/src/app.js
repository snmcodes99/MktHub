const express=require("express");
const authRoutes=require("./routes/authRoutes")
const errorMiddleware=require("./middleware/error/errorMiddleware")
const categoryRoutes=require("./routes/categoryRoutes");
const productRoutes=require("./routes/productRoutes")
const sellerRequestRoutes=require("./routes/sellerRequestRoutes")
const addressRoutes=require("./routes/addressRoutes")
const cartRoutes=require("./routes/cartRoutes")
const orderRoutes=require("./routes/orderRoutes")
const paymentRoutes=require("./routes/paymentRoutes")
const reviewRoutes=require("./routes/reviewRoutes")
const adminRoutes=require("./routes/adminRoutes")
const app=express();
app.use(express.json())

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"hello from app"
    })
})

app.use("/api/auth",authRoutes);
app.use("/api/category",categoryRoutes)
app.use("/api/product",productRoutes)
app.use("/api/seller-request",sellerRequestRoutes)
app.use("/api/addresses",addressRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/payment",paymentRoutes)
app.use("/api/review",reviewRoutes)
app.use("/api/admin",adminRoutes)

app.use(errorMiddleware)
module.exports=app