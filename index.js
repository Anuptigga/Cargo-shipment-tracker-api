import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import shipmentRoute from "./routes/shipment.js";
import dotenv from "dotenv";
dotenv.config();
const app=express();
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("DB Connected Successfully");
}).catch((error)=>{
    console.log(error);
});

app.use(cors());
app.use(express.json());
app.use("/",shipmentRoute);



app.listen(5000,()=>{
    console.log("server running on port:5000");
});
