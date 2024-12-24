const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    make: { type: String, required: true }, // Car manufacturer, e.g., Toyota
    model: { type: String, required: true }, // Car model, e.g., Corolla
comfort:  {
        type: String,
        enum: ["Mini", "Compact", "Luxury"],
        required: true,
    }, 
    type: {
        type: String,
        enum: ["Sedan", "SUV", "Hatchback", "Truck"],
        required: true,
    }, // Car type
    seatingCapacity: { type: Number, required: true, enum: [2, 4, 6, 8] }, // Number of seats
    colors: [
        {
            name: { type: String, required: true }, // Color name, e.g., Red, Black
            image: { type: String, required: true }, // URL of the car's image in this color
        },
    ],
});
carSchema.index({ make: 1, model: 1 }, { unique: true });
const carModel = mongoose.model("Car", carSchema);
module.exports = carModel;
