const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(401)
                .json({ message: "Token expired or invalid" });
        }

        req.user = user; // Attach user data to the request object
        next(); // Proceed to the next middleware or route
    });
}

module.exports = authenticateToken;
