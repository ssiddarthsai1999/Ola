const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute.js");
const driverRoute = require("./routes/driverRoute.js");
const carRoute = require("./routes/carRoute.js");
const yourCarRoute = require("./routes/yourCarRoute.js");
const rideRoute = require("./routes/rideRoute.js");

dotenv.config();

const app = express();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL
        credentials: true, // Allow cookies and credentials to be sent
    },
});

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173", // Replace with your frontend URL
        credentials: true, // Allow cookies and credentials to be sent
    })
);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        server.listen(process.env.PORT, () =>
            console.log(`Server running on port ${process.env.PORT}`)
        ); // Use the server created for Socket.IO
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/user", userRoute);
app.use("/driver", driverRoute);
app.use("/car", carRoute);
app.use("/yourCar", yourCarRoute);
app.use("/ride", rideRoute);
