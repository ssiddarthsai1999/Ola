const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const carTypeModel = require("../models/carTypeModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeSuperAdmin = require("../middlewares/authorizeSuperAdmin");
const authorizeUser = require("../middlewares/authorizeUser");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******Car Type Create************************************************************************************************************************************************************************************ */

router.post(
    "/carTypeCreate",
    authenticateToken,
    authorizeSuperAdmin,
    async (req, res) => {
        try {
            const { comfort, image, basePricePerKm, basePricePerMin } =
                req.body;

            // Create the car
            const newCar = await carTypeModel.create({
                comfort,
                image,
                basePricePerKm,
                basePricePerMin,
            });

            res.status(201).json({
                message: "Car type created successfully",
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
//******Get All Car Types*******************************************************************************************************************************************************************************/

router.get(
    "/carTypeGetAll",
    authenticateToken,
    authorizeUser,
    async (req, res) => {
        try {
            const carTypes = await carTypeModel.find();

            if (!carTypes || carTypes.length === 0) {
                return res.status(404).json({ message: "No car types found" });
            }

            res.status(200).json({
                message: "Car types fetched successfully",
                response: carTypes,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching car types",
                error: error.message,
            });
        }
    }
);

module.exports = router;