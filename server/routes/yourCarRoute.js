const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const yourCarModel = require("../models/yourCarModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeDriver = require("../middlewares/authorizeDriver");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******Your Car Registration************************************************************************************************************************************************************************************ */

router.post(
    "/yourCarRegister",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
        const driverId = req.user._id;

            const {
                currentLocation,
                registrationNumber,
                year,
                color,
                carModel,
            } = req.body;
            // Create the car
            const yourNewCar = await yourCarModel.create({
                currentLocation,
                registrationNumber,
                year,
                driver: driverId,
                carModel,
                color,
            });

            res.status(201).json({
                message: "Your Car created successfully",
                response: yourNewCar,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error creating your car",
                error: error.message,
            });
        }
    }
);

//******Car Update************************************************************************************************************************************************************************************ */

router.put(
    "/yourCarUpdate/:id",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const yourCarId = req.params.id; // Extract YourCar ID from URL parameters
            const updateFields = req.body; // Get fields to update from the request body

            // Update the YourCar document
            const updatedYourCar = await yourCarModel.findByIdAndUpdate(
                yourCarId,
                updateFields,
                { new: true } // Return the updated document
            );

            if (!updatedYourCar) {
                return res
                    .status(404)
                    .json({ message: "YourCar entry not found" });
            }

            res.status(200).json({
                message: "Car updated successfully",
                response: updatedYourCar,
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
