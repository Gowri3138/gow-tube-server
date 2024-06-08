const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoConnection = require("./helps/dbConfig");
const logger = require("./logger/logger");
const fs = require('fs');
const path = require('path');


// routes
const authRoutes = require("./routes/auth");
const channelRoutes = require("./routes/channels");
const videoRoutes = require("./routes/videos");
const uploadRoutes = require("./routes/uploads");

const app = express();
dotenv.config();

const PORT = process.env.SERVER_PORT || 5001;

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


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

app.get("/api/logs", (req, res) => {
  fs.readFile(path.join(__dirname, 'logs', 'combined.log'), 'utf8', (err, data) => {
    if (err) {
      logger.error('Error reading log file:', err.message);
      return res.status(500).json("Error reading log file");
    }
    res.send(`<pre>${data}</pre>`);
  });
});

app.listen(PORT, () => {
  mongoConnection();
  logger.info("Server is listening on Port: " + PORT);
});
