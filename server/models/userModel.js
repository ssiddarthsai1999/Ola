const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user", enum: ["user", "superadmin"] },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: Number },
    profilePicture: { type: String }, // URL to the profile picture
    address: [
        {
            label: { type: String }, // Example: "Home", "Work"
            location: {
                lat: { type: Number }, // Latitude
                lng: { type: Number }, // Longitude
            },
        },
    ],
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    favouriteSpots: [
        {
            label: { type: String }, // Example: "Home", "Work"
            location: {
                lat: { type: Number }, // Latitude
                lng: { type: Number }, // Longitude
            },
        },
    ],
    profileCompleted: { type: Boolean, default: false }, // Defaults to false
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
