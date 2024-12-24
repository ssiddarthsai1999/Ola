const jwt = require("jsonwebtoken");
const driverModel = require("../models/driverModel.js");

async function authorizeDriver(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by email from the decoded token
        const driver = await driverModel.findOne({ email: decoded.email });

        if (!driver) {
            return res
                .status(404)
                .json({ message: "Access restricted to drivers only" });
        }

        // Check if the user's role is "user"
        if (driver.role !== "driver") {
            return res
                .status(403)
                .json({ message: "Access restricted to drivers only" });
        }

        req.user = driver; // Attach user details to the request object
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(401).json({
            message: "Access restricted to drivers only",
            error: error.message,
        });
    }
}

module.exports = authorizeDriver;
