const mongoose = require("mongoose");

const yourCarSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
    }, // Reference to the driver who owns this car
    carModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true,
    }, // Reference to the predefined Car model
    color: {
        type: String,
        required: true,
    }, // Chosen color for the car
    year: {
        type: Number,
        required: true,
    }, // Year of the car
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
    }, // Vehicle registration number
});

const yourCarModel = mongoose.model("YourCar", yourCarSchema);
module.exports = yourCarModel;
