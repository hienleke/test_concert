import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createBooking, getBookingById, cancelBooking } from "./controllers/bookingController";
import { logger } from "@concert/shared";
import {connectDB} from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
connectDB();

// Routes
app.get("/booking/:id", getBookingById);
app.post("/booking", createBooking);
app.delete("/booking", cancelBooking);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  logger.info(`Booking Service is running on port ${PORT}`);
});
