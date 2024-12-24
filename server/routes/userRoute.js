const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeUser = require("../middlewares/authorizeUser");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******User Registration************************************************************************************************************************************************************************************ */

router.post("/userRegister", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email: email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            email,
            password: hashedPassword,
        });

        return res.status(200).json({
            message: "User registered successfully",
            response: newUser,
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error with user registration",
            error,
        });
    }
});

//******User Login************************************************************************************************************************************************************************************ */

router.post("/userLogin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                message: "User does not exist. Register first please!",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role }, // Include the role in the payload
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Token expiration
        );

        // Set the token in an HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production", // Send over HTTPS in production
            sameSite: "Strict", // Prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
        });

        // Send the user data back to the client
        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                address: user.address,
                dob: user.dob,
                gender: user.gender,
                favouriteSpots: user.favouriteSpots,
                profileCompleted: user.profileCompleted,
            },
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error with user login",
            error,
        });
    }
});

//******Complete Profile************************************************************************************************************************************************************************************ */

router.put(
    "/completeProfileUser",
    authenticateToken,
    authorizeUser,
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
            const updatedUser = await userModel.findByIdAndUpdate(
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

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                message: "Profile completed successfully",
                response: updatedUser,
            });
        } catch (error) {
            return res.status(400).json({
                message: "Error completing profile",
                error: error.message,
            });
        }
    }
);

//******Update Profile************************************************************************************************************************************************************************************ */

router.put(
    "/updateProfileUser",
    authenticateToken,
    authorizeUser,
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
            } = req.body;

            // Extract user ID from authenticated token
            const userId = req.user._id;

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
            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    phoneNumber,
                    gender,
                    age,
                    profilePicture,
                    address,
                    favouriteSpots,
                },
                { new: true, runValidators: true } // Return the updated user
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({
                message: "Profile updated successfully",
                response: updatedUser,
            });
        } catch (error) {
            return res.status(400).json({
                message: "Error updating profile",
                error: error.message,
            });
        }
    }
);

// Validation route for users*******************************************************************************************************************************************************************************

router.get("/validateUser", authenticateToken, authorizeUser, (req, res) => {
    return res.status(200).json({
        message: "User is authorized",
    });
});

module.exports = router;
