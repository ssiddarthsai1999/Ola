const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel.js");

async function authorizeSuperAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by email from the decoded token
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res
                .status(404)
                .json({ message: "Access restricted to superadmins only" });
        }

        // Check if the user's role is "user"
        if (user.role !== "superadmin") {
            return res
                .status(403)
                .json({ message: "Access restricted to superadmins only" });
        }

        req.user = user; // Attach user details to the request object
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(401).json({
            message: "Access restricted to superadmins only",
            error: error.message,
        });
    }
}

module.exports = authorizeSuperAdmin;
