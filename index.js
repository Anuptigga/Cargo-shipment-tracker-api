import express from "express";
import mongoose from "mongoose";
import shipmentRoute from "./routes/shipment.js";
const app=express();
const MONGO_URL="mongodb+srv://anup:anup2024@cluster0.cthm1.mongodb.net/Cargo";
mongoose.connect(MONGO_URL).then(()=>{
    console.log("DB Connected Successfully");
}).catch((error)=>{
    console.log(error);
});

app.use(express.json());
app.use("/",shipmentRoute);



app.listen(5000,()=>{
    console.log("server running on port:5000");
});
