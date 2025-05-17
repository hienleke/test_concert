import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { 
  register, 
  login, 
  getProfile, 
  verifyToken, 
  logout 
} from "./controllers/authController";
import { 
  registerValidation, 
  loginValidation 
} from "./middleware/validation";
import connectDB from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
connectDB();

// Routes
app.post("/auth/register", registerValidation, register);
app.post("/auth/login", loginValidation, login);
app.post("/auth/logout", verifyToken, logout);
app.get("/auth/profile", verifyToken, getProfile);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});


