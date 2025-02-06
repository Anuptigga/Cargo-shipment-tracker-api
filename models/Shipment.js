import mongoose, { Schema } from "mongoose";

const ShipmentSchema = new Schema({
    containerId: { type: String, unique: true, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    route:{type:Array},
    currentLocation: { type: String, required: true },
    ETA: { type: Date },
    status: { type: String, enum: ["In Transit", "Delivered"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Shipment", ShipmentSchema);
