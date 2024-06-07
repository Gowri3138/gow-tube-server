const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoConnection = require("./helps/dbConfig");

// routes
const authRoutes = require("./routes/auth");
const channelRoutes = require("./routes/channels");
const videoRoutes = require("./routes/videos");
const uploadRoutes = require("./routes/uploads");

const app = express();
dotenv.config();

const PORT = process.env.SERVER_PORT || 5001;

// Custom logging middleware
const logRequestDetails = (req, res, next) => {
  console.log(`\nRequest Method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
  console.log(`Request Body: ${JSON.stringify(req.body, null, 2)}`);
  console.log(`Request Cookies: ${JSON.stringify(req.cookies, null, 2)}`);
  next();
};

//middlewares
app.use(morgan('combined')); // Logs HTTP requests
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(logRequestDetails); // Add custom logging middleware

// routes
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/uploads", uploadRoutes);

// Test route
app.get("/api/isworking", (req, res) => {
  console.log("Accessed /api/isworking route");
  res.send("API is working!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).send(err.message);
});

app.listen(PORT, () => {
  mongoConnection();
  console.log("Server is listening on Port: " + PORT);
});
