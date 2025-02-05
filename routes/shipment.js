import { Router } from "express";
import Shipment from "../models/Shipment.js";
import axios from "axios";

const router=Router();
const G_MAP_KEY="AlzaSyIV0zeb3x0Hb14H_niKMGKdj5L0PY_Aq1g";

//get route 
const getRoute=async(origin,destination)=>{
    try {
        const response=await axios.get(
            `https://maps.gomaps.pro/maps/api/directions/json`,
            {
                params:{
                    origin,
                    destination,
                    key:G_MAP_KEY
                }
            }

        );
        const steps=response.data.routes[0].legs[0].steps;
        return steps;

    } catch (error) {
        
    }
}




//POST
router.post("/shipment",async(req,res)=>{
    try {
    const {containerId, origin, destination, currentLocation, ETA, status } = req.body;
    const existingShipment= await Shipment.findOne({containerId});
    const route= await getRoute(origin,destination);

    if(existingShipment){
        return res.status(400).json({message:"Container already exists"});
    }


    const newShipment= new Shipment({
        containerId,
        origin,
        destination,
        route,
        currentLocation,
        ETA,
        status
    });
        const savedShipment= await newShipment.save();
        res.status(200).json(savedShipment);
    } catch (error) {
        res.status(500).json(error);
    }
},

)
//GET ALL
router.get("/shipments",async(req,res)=>{
    try {
        const shipments=await Shipment.find();
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json(error);
    }
})

//GET BY ID
router.get("/shipment/:id",async(req,res)=>{
    try {
        const shipment=await Shipment.findById(req.params.id);
        if(!shipment){
           return res.status(404).json({message:"Shipment not found"});
        }
        res.status(200).json(shipment);
    } catch (error) {
        res.status(500).json(error);
    }
})

//POST UPDATE LOCATION
router.put("/shipment/:id/update-location",async(req,res)=>{
    try {
        const shipment= await Shipment.findById(req.params.id);
        const {currentLocation}=req.body;
        shipment.currentLocation=currentLocation;
        await shipment.save();
        res.status(200).json({message:"Updated Successfully", shipment});
    } catch (error) {
        res.status(500).json(error);
    }
})


//GET ETA
router.get("/shipment/:id/eta",async(req,res)=>{
    try {
        const shipment= await Shipment.findById(req.params.id);
        res.status(200).json({ETA:shipment.ETA});
    } catch (error) {
        res.status(500).json(error);
    }
})
export default router;