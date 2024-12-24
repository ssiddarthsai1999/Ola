const mongoose = require("mongoose");

const carTypeSchema = new mongoose.Schema({
    comfort: {
        type: String,
        enum: ["Mini", "Compact", "Luxury"],
        required: true,
    },
    image: {
        type: String,
        required: true, // Image URL for the car type
    },
    basePricePerKm: {
        type: Number,
        required: true, // Base price per km for the car type
    },
    basePricePerMin: {
        type: Number,
        required: true, // Multiplier for additional fare calculations
    },
});

const carTypeModel = mongoose.model("CarType", carTypeSchema);

module.exports = carTypeModel;
