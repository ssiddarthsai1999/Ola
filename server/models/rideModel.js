const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Reference to the user requesting the ride
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
    }, // Reference to the driver accepting the ride
    carType: {
        type: String,
        enum: ["Compact", "Mini", "Luxury"],
        required: true,
    }, // Car type selected for the ride
    currentDriverLocation: {
        lat: { type: Number },
        lng: { type: Number },
    }, // Real-time driver location
    pickUpLocation: {
        name: { type: String },
        lat: { type: Number }, // Latitude
        lng: { type: Number }, // Longitude
    },
    dropOffLocation: {
        name: { type: String },
        lat: { type: Number }, // Latitude
        lng: { type: Number }, // Longitude
    },
    otp: {
        type: Number,
    }, // OTP for ride confirmation
    fare: { type: Number, required: true }, // Calculated fare for the ride
    status: {
        type: String,
        enum: [
            "Requested",
            "Accepted",
            "In Progress",
            "Completed",
            "Cancelled",
        ],
        default: "Requested",
    }, // Status of the ride
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the ride was created
    completedAt: { type: Date }, // Timestamp for when the ride was completed
    userRating: {
        score: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
    }, // User feedback about the driver
    driverRating: {
        score: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
    }, // Driver feedback about the user
    cancelledBy: { type: String, enum: ["user", "driver"] },
    cancellationReason: { type: String }, // Reason for cancellation
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
    }, // Payment status for the ride
    paymentMode: {
        type: String,
        enum: ["Cash", "Card", "Upi"],
        default: "Cash",
    },
});

const rideModel = mongoose.model("Ride", rideSchema);
module.exports = rideModel;
