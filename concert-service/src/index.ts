import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { connectDB } from "./db";
import { logger } from "@concert/shared";
import router from "./router/concertRoutes";
import { redisService } from "./event/redisService";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/concert", router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});


// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});


