const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const carModel = require("../models/carModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeSuperAdmin = require("../middlewares/authorizeSuperAdmin");
const authorizeUser = require("../middlewares/authorizeUser");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******Car Registration************************************************************************************************************************************************************************************ */

router.post(
    "/carRegister",
    authenticateToken,
    authorizeSuperAdmin,
    async (req, res) => {
        try {
            const { make, model, type, seatingCapacity, colors,comfort } = req.body;

            // Create the car
            const newCar = await carModel.create({
                make,
                model,
                type,
                seatingCapacity,
                colors,
                comfort
            });

            res.status(201).json({
                message: "Car created successfully",
                response: newCar,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error creating car",
                error: error.message,
            });
        }
    }
);

//******Car Update************************************************************************************************************************************************************************************ */

router.put(
    "/carUpdate/:id",
    authenticateToken,
    authorizeSuperAdmin,
    async (req, res) => {
        try {
            const carId = req.params.id; // Extract car ID from URL parameters
            const updateFields = req.body; // Get fields to update from the request body

            // Update the car
            const updatedCar = await carModel.findByIdAndUpdate(
                carId,
                updateFields,
                { new: true } // Return the updated car
            );

            if (!updatedCar) {
                return res.status(404).json({ message: "Car not found" });
            }

            res.status(200).json({
                message: "Car updated successfully",
                response: updatedCar,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error updating car",
                error: error.message,
            });
        }
    }
);



module.exports = router;
