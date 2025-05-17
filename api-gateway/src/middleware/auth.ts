import { Request, Response, NextFunction } from "express";
import { redisStreamOperations, CHANNELS } from "@concert/shared";
import {StreamMessage} from "../types"

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestStream = `${CHANNELS.AUTH.TOKEN_VALIDATION}:requests`;
    const responseStream = `${CHANNELS.AUTH.TOKEN_VALIDATION}:responses`;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let id = await redisStreamOperations.publishToStream(
      requestStream,
      token,

    );
    // Send token verification request to auth service using request-response pattern
    const result = await redisStreamOperations.readFromStream(
      responseStream,
      id
    )  as StreamMessage[];

    if (!result || result.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if(!result[0].data.isvalid){
      return res.status(401).json({ error: "Invalid token" });
    }
      const user = result[0].data.user;
      req.body.user = user;
      return next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
