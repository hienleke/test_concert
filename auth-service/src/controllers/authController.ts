import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthService,  } from "../services/authService";
import { logger } from "@concert/shared";
import { ITokenPayload } from "../types/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const authInstance = await AuthService.getInstance();
    const result = await authInstance.register(email, password, name);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.data);
  } catch (error: any) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Login user using auth service
    const authInstance = await AuthService.getInstance();
    const result = await authInstance.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error: any) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: error.message || "Login failed" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get user data using the user from the request (added by verifyToken middleware)
    res.json({
      id: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    });
  } catch (error: any) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({ error: error.message || "Error fetching profile" });
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify token using auth service
    const authInstance = await AuthService.getInstance();
    const result = await authInstance.validateToken(token);
    
    if (!result.success || !result.data) {
      return res.status(401).json({ 
        error: result.error || "Invalid or expired token" 
      });
    }

    // Add user to request object
    req.user = result.data;
    next();
  } catch (error: any) {
    logger.error(`Token verification failed: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    return res.status(401).json({ 
      error: error.message || "Invalid token" 
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(400).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const authInstance = await AuthService.getInstance();
    const result = await authInstance.logout(token);

    if (!result) {
      return res.status(400).json({ error: 'Failed to process logout' });
    }

    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error: any) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
};
