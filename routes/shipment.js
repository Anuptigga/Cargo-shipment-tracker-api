import { Router } from "express";
import Shipment from "../models/Shipment.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const router=Router();

//get coordinates
const getCoordinates = async (locationName) => {
    try {
        const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${process.env.G_MAP_KEY}`;
        
        const response = await axios.get(url);
        if (response.data.status === "OK") {
            const { lat, lng } = response.data.results[0].geometry.location;
            return { lat, lng };
        } else {
            throw new Error("Invalid location or API limit reached");
        }
    } catch (error) {
        console.error("Geocoding error:", error.message);
        return null;
    }
};

//get ETA
const getETA=async(origin,destination)=>{
    try {
        const response=await axios.get(
            `https://maps.gomaps.pro/maps/api/distancematrix/json`,
            {
                params:{
                    origins:origin,
                    destinations:destination,
                    key:process.env.G_MAP_KEY
                }
            }
        );
        const etaSeconds = response.data.rows[0].elements[0].duration.value;
        const etaDate= new Date(Date.now()+etaSeconds*1000);
    
        return etaDate;
    } catch (error) {
        return 
    }
}


//POST
router.post("/shipment", async (req, res) => {
    try {
        const { containerId, origin, destination, status } = req.body;


        const existingShipment = await Shipment.findOne({ containerId });
        if (existingShipment) {
            return res.status(400).json({ message: "Container already exists" });
        }


        const originCoords = await getCoordinates(origin);
        const destinationCoords = await getCoordinates(destination);
        if (!originCoords || !destinationCoords) {
            return res.status(400).json({ message: "Invalid origin or destination" });
        }
        const currentLocation = { name: origin, coordinates: originCoords };
        const ETA = await getETA(currentLocation.name,destination);
        const route = [{ name: origin, coordinates: originCoords }];


        const newShipment = new Shipment({
            containerId,
            origin: { name: origin, coordinates: originCoords },
            destination: { name: destination, coordinates: destinationCoords },
            route,
            currentLocation,
            ETA,
            status,
        });

        const savedShipment = await newShipment.save();
        res.status(200).json(savedShipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

//PUT UPDATE LOCATION
router.put("/shipment/:id/update-location",async(req,res)=>{
    try {
        const shipment= await Shipment.findById(req.params.id);
        
        const {newLocation}=req.body;
        const newETA= await getETA(newLocation.name,shipment.destination);
        const newCoords= await getCoordinates(newLocation.name);
        shipment.currentLocation={name:newLocation.name, coordinates:newCoords};
        shipment.route.push({ name: newLocation.name, coordinates: newCoords });
        shipment.ETA=newETA;
        await shipment.save();
        res.status(200).json({message:"Updated Successfully", shipment});
    } catch (error) {
        res.status(500).json(error);
    }
})


// UPDATE STATUS
router.put("/shipment/:id", async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id);
        const { status } = req.body;
        shipment.status = status;
        if(status==="Delivered"){
            shipment.currentLocation = {
                name: shipment.destination.name,
                coordinates: shipment.destination.coordinates
            };
            shipment.route.push({
                name: shipment.destination.name,
                coordinates: shipment.destination.coordinates
            });
            shipment.ETA = new Date();
        }
        await shipment.save();
        res.status(200).json({ message: "Updated Successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;