const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    password: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: { type: String, default: "driver" },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: Number },
    profilePicture: { type: String }, // URL to the profile picture

    languages: { type: [String] }, // Array of languages, e.g., ["English", "Hindi"]

    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
    },

    dob: { type: Date },
    gender: { type: String },
    carDetails: { type: mongoose.Schema.Types.ObjectId, ref: "YourCar" },
    profileCompleted: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
});

const driverModel = mongoose.model("Driver", driverSchema);
module.exports = driverModel;
