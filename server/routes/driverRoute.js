const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const driverModel = require("../models/driverModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeDriver = require("../middlewares/authorizeDriver");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******Driver Registration************************************************************************************************************************************************************************************ */

router.post("/driverRegister", async (req, res) => {
    try {
        const { email, password } = req.body;

        const driver = await driverModel.findOne({ email: email });

        if (driver) {
            res.status(400).json({ message: "Driver already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newDriver = await driverModel.create({
            email,
            password: hashedPassword,
        });

        res.status(200).json({
            message: "Driver registered successfully",
            response: newDriver,
        });
    } catch (error) {
        res.status(400).json({
            message: "Error with Driver registration",
            error,
        });
    }
});

//******User Login************************************************************************************************************************************************************************************ */

router.post("/driverLogin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const driver = await driverModel.findOne({ email: email });

        if (!driver) {
            res.status(400).json({
                message: "Driver does not exist. Register first please!",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { _id: driver._id, email: driver.email, role: driver.role }, // Include the role in the payload
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            driver,
        });
    } catch (error) {
        res.status(400).json({
            message: "Error with driver login",
            error,
        });
    }
});

//******Complete Profile************************************************************************************************************************************************************************************ */

router.put(
    "/completeProfileDriver",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const { firstName, lastName, phoneNumber, gender, age } = req.body;

            // Extract user ID from authenticated token
            const userId = req.user._id;

            if (!firstName || !lastName || !phoneNumber || !gender || !age) {
                return res.status(400).json({
                    message:
                        "All mandatory fields (firstName, lastName, phoneNumber, gender, age) must be provided",
                });
            }
            // Update user profile
            const updatedDriver = await driverModel.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    phoneNumber,
                    gender,
                    age,

                    profileCompleted: true, // Mark profile as completed
                },
                { new: true } // Return the updated user
            );

            if (!updatedDriver) {
                return res.status(404).json({ message: "Driver not found" });
            }

            res.status(200).json({
                message: " Driver Profile completed successfully",
                response: updatedDriver,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error completing Driver profile",
                error: error.message,
            });
        }
    }
);

//******Update Profile************************************************************************************************************************************************************************************ */

router.put(
    "/updateProfileDriver",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                phoneNumber,
                gender,
                age,
                profilePicture,
                address,
                favouriteSpots,
                currentLocation,
            } = req.body;

            // Extract user ID from authenticated token
            const driverId = req.user._id;

            // Validation: Ensure no mandatory field is empty if provided
            const mandatoryFields = {
                firstName,
                lastName,
                phoneNumber,
                gender,
                age,
            };

            for (const [key, value] of Object.entries(mandatoryFields)) {
                if (value !== undefined && value === "") {
                    return res.status(400).json({
                        message: `${key} cannot be empty`,
                    });
                }
            }

            // Update user profile
            const updatedDriver = await driverModel.findByIdAndUpdate(
                driverId,
                {
                    firstName,
                    lastName,
                    phoneNumber,
                    gender,
                    age,
                    profilePicture,
                    address,
                    favouriteSpots,
                    currentLocation,
                },
                { new: true, runValidators: true } // Return the updated user
            );

            if (!updatedDriver) {
                return res.status(404).json({ message: "Driver not found" });
            }

            res.status(200).json({
                message: " Driver Profile updated successfully",
                response: updatedDriver,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error updating driver profile",
                error: error.message,
            });
        }
    }
);

// Validation route for drivers*******************************************************************************************************************************************************************************
router.get(
    "/validate-driver",
    authenticateToken,
    authorizeDriver,
    (req, res) => {
        return res.status(200).json({
            message: "Driver is authorized",
        });
    }
);

module.exports = router;
