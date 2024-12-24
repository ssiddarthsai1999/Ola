const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rideModel = require("../models/rideModel");
const yourCarModel = require("../models/yourCarModel");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeUser = require("../middlewares/authorizeUser");
const authorizeDriver = require("../middlewares/authorizeDriver");
const checkDriverAvailability = require("../middlewares/checkDriverAvailability");
const driverModel = require("../models/driverModel");
const router = express.Router();

//****************************************************************Routes start from here************************************************************************************************************************** */

//******Your Ride Creation************************************************************************************************************************************************************************************ */

router.post(
    "/rideCreate",
    authenticateToken,
    authorizeUser,
    async (req, res) => {
        try {
            const userId = req.user._id;

            const {
                pickUpLocation,
                dropOffLocation,
                fare,
                paymentMode,
                carType,
            } = req.body;

            // Create the ride
            const ride = await rideModel.create({
                pickUpLocation,
                dropOffLocation,
                fare,
                paymentMode,
                carType,
                user: userId,
                status: "Requested",
            });

     
   

            res.status(201).json({
                message: "Ride created successfully",
                response: ride,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error creating your ride",
                error: error.message,
            });
        }
    }
);

//******Get Ride by ID*************************************************************************************************************************************************************************************/

router.get(
    "/rideGetForUser/:id",
    authenticateToken,
    authorizeUser, // Ensure the user is authorized to fetch this ride
    async (req, res) => {
        try {
            const rideId = req.params.id;

            // Find the ride by ID
            const ride = await rideModel.findById(rideId);

            if (!ride) {
                return res.status(404).json({ message: "Ride not found" });
            }

            res.status(200).json({
                message: "Ride fetched successfully",
                response: ride,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride",
                error: error.message,
            });
        }
    }
);

//******Getting your rides to drivers************************************************************************************************************************************************************************************ */

router.get(
    "/rideListForDrivers",
    authenticateToken,
    authorizeDriver,
    checkDriverAvailability,
    async (req, res) => {
        try {
            const driverId = req.user._id;

            // Find the driver's car and its comfort type
            const driverCar = await yourCarModel
                .findOne({ driver: driverId })
                .populate({
                    path: "carModel",
                    select: "comfort", // Only fetch the comfort type
                });

            if (!driverCar) {
                return res.status(404).json({
                    message: "No car found for this driver",
                });
            }

            const driverCarComfort = driverCar.carModel.comfort;

            // Find rides that match the driver's car comfort type
            const matchingRides = await rideModel.find({
                carType: driverCarComfort, // Ensure carType matches the car's comfort
                status: "Requested", // Show only rides with status 'Requested'
            });

            if (matchingRides.length === 0) {
                return res.status(404).json({
                    message: "No rides available for your car comfort type",
                });
            }

            res.status(200).json({
                message: "Rides fetched successfully",
                rides: matchingRides,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching rides for drivers",
                error: error.message,
            });
        }
    }
);

//******Accept rides as drivers************************************************************************************************************************************************************************************ */
const generateOtp = () => Math.floor(1000 + Math.random() * 9000);
router.put(
    "/acceptRide/:id",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const driverId = req.user._id; // Extract driver ID from token
            const rideId = req.params.id; // Ride ID from URL parameters
            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }
            if (!driverId) {
                return res.status(404).json({
                    message: "No such driver registered",
                });
            }
            // Generate a random 4-digit OTP
            const otp = generateOtp();

            // Update the ride with the driverId and OTP, set status to 'Accepted'
            const acceptedRide = await rideModel.findByIdAndUpdate(
                rideId,
                {
                    driver: driverId,
                    otp: otp,
                    status: "Accepted",
                },
                { new: true } // Return the updated ride
            );

            if (!acceptedRide) {
                return res.status(404).json({
                    message: "Ride not found or already accepted",
                });
            }
            const driver = await driverModel.findById(driverId);
            driver.isAvailable = false;
            await driver.save();

            const { otp: excludedOtp, ...rideWithoutOtp } =
                acceptedRide.toObject();
            res.status(200).json({
                message: "Ride accepted successfully",
                ride: rideWithoutOtp,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error accepting ride",
                error: error.message,
            });
        }
    }
);

//******show accepted  ride to user************************************************************************************************************************************************************************************ */

router.get(
    "/showAcceptedRideToUser/:id",
    authenticateToken,
    authorizeUser,
    async (req, res) => {
        try {
            const rideId = req.params.id; // Ride ID from URL parameters

            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }

            // Find the ride by ID and populate driver and car details
            const ride = await rideModel.findById(rideId).populate({
                path: "driver",
                select: "-password -email -role -profileCompleted -isAvailable -__v",
            });

            const carDriver = ride.driver._id;
            const carDetails = await yourCarModel
                .findOne({
                    driver: carDriver,
                })
                .populate({
                    path: "carModel",
                    select: "-colors",
                });

            if (!ride) {
                return res.status(404).json({
                    message: "Ride not found",
                });
            }

            if (ride.status !== "Accepted") {
                return res.status(400).json({
                    message: "This ride has not been accepted yet",
                });
            }

            res.status(200).json({
                message: "Ride fetched successfully",
                ride,
                carDetails,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride details",
                error: error.message,
            });
        }
    }
);

//******show accepted  ride to driver************************************************************************************************************************************************************************************ */

router.get(
    "/showAcceptedRideToDriver/:id",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const rideId = req.params.id; // Ride ID from URL parameters

            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }

            // Find the ride by ID and populate driver and car details
            const ride = await rideModel.findById(rideId).populate({
                path: "user",
                select: "-password -email -role -profileCompleted -__v -address -favouriteSpots",
            });

            if (!ride) {
                return res.status(404).json({
                    message: "Ride not found",
                });
            }

            if (ride.status !== "Accepted") {
                return res.status(400).json({
                    message: "This ride has not been accepted yet",
                });
            }
            const { otp, ...rideWithoutOtp } = ride.toObject();

            res.status(200).json({
                message: "Ride fetched successfully",
                ride: rideWithoutOtp,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride details",
                error: error.message,
            });
        }
    }
);

//******Start journey************************************************************************************************************************************************************************************ */

router.put(
    "/startJourney/:id",
    authenticateToken,
    authorizeDriver,

    async (req, res) => {
        try {
            const rideId = req.params.id; // Ride ID from URL parameters
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({
                    message: "OTP is required to start the journey",
                });
            }
            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }

            // Find the ride by ID and populate driver and car details
            const ride = await rideModel.findById(rideId);

            if (!ride) {
                return res.status(404).json({
                    message: "Ride not found",
                });
            }

            if (ride.status !== "Accepted") {
                return res.status(400).json({
                    message: "This ride has not been accepted yet",
                });
            }
            // Check if the OTP matches
            if (ride.otp !== otp) {
                return res.status(400).json({
                    message: "Invalid OTP",
                });
            }

            ride.status = "In Progress";
            await ride.save();
            res.status(200).json({
                message: "Ride started successfully",
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride details",
                error: error.message,
            });
        }
    }
);

//******show final  ride to user************************************************************************************************************************************************************************************ */

router.get(
    "/showFinalRideToUser/:id",
    authenticateToken,
    authorizeUser,
    async (req, res) => {
        try {
            const rideId = req.params.id; // Ride ID from URL parameters

            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }

            // Find the ride by ID and populate driver and car details
            const ride = await rideModel.findById(rideId).populate({
                path: "driver user",
                select: "-password -email -role -profileCompleted -isAvailable -__v",
            });

            const carDriver = ride.driver._id;
            const carDetails = await yourCarModel
                .findOne({
                    driver: carDriver,
                })
                .populate({
                    path: "carModel",
                    select: "-colors",
                });

            if (!ride) {
                return res.status(404).json({
                    message: "Ride not found",
                });
            }

            if (ride.status !== "In Progress") {
                return res.status(400).json({
                    message: "This ride is not in progress yet",
                });
            }

            res.status(200).json({
                message: "Ride fetched successfully",
                ride,
                carDetails,
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride details",
                error: error.message,
            });
        }
    }
);

//******complete ride************************************************************************************************************************************************************************************ */

router.put(
    "/completeRide/:id",
    authenticateToken,
    authorizeDriver,
    async (req, res) => {
        try {
            const rideId = req.params.id; // Ride ID from URL parameters

            if (!rideId) {
                return res.status(404).json({
                    message: "No such ride created",
                });
            }

            // Find the ride by ID and populate driver and car details
            const ride = await rideModel.findById(rideId);

            if (!ride) {
                return res.status(404).json({
                    message: "Ride not found",
                });
            }

            if (ride.status !== "In Progress" && ride.status !== "Completed") {
                return res.status(400).json({
                    message: "This ride is neither in progress nor completed",
                });
            }

            ride.status = "Completed";
            ride.paymentStatus = "Paid";
            await ride.save();

            res.status(200).json({
                message: "Ride completed successfully",
            });
        } catch (error) {
            res.status(400).json({
                message: "Error fetching ride details",
                error: error.message,
            });
        }
    }
);

module.exports = router;
