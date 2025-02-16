import mongoose, { Schema } from "mongoose";

const ShipmentSchema = new Schema({
    containerId: { type: String, unique: true, required: true },
    origin: {
        name: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    },
    destination: {
        name: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    },
    route: [{
        name: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    }],
    currentLocation: {
        name: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    },
    ETA: { type: Date },
    status: { type: String, enum: ["In Transit", "Delivered"], default: "In Transit" }
}, { timestamps: true });


export default mongoose.model("Shipment", ShipmentSchema);
