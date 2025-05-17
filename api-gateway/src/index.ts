import express from 'express';
import { ClientRequest } from 'http';
import { Request, Response } from 'express-serve-static-core';
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import { logger } from "@concert/shared/utils/logger";
import { verifyToken } from "./middleware/auth";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(limiter);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:3002";
const CONCERT_SERVICE_URL = process.env.CONCERT_SERVICE_URL || "http://localhost:3003";


const baseProxyOptions = {
  changeOrigin: true,
  // onError: (err: any, req: any, res: any) => {
  //   logger.error(`Proxy Error: ${err.message}`);
  //   res.status(500).json({ 
  //     error: `Service unavailable: ${err.message}`,
  //     service: req.originalUrl.split('/')[2] // Extract service name from URL
  //   });
  // },
  onProxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
    if (!req.body || !Object.keys(req.body).length) {
      return;
    }
  
    let bodyData;
    if (typeof req.body === 'string') {
      try {
        JSON.parse(req.body); // Validate it's JSON string
        bodyData = req.body;  // Already JSON string, no need to stringify
      } catch {
        bodyData = JSON.stringify(req.body);
      }
    } else {
      bodyData = JSON.stringify(req.body);
    }
    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.status(500).json({ error: 'Proxy request error' });
    });
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
};


app.use(
  "/api/auth",
  createProxyMiddleware({
    ...baseProxyOptions,
    target: AUTH_SERVICE_URL,
    pathRewrite: {
      "^/api/auth": "auth",  // Adjust to what your auth service expects
    },
    logLevel: 'debug',
  })
);

app.use(
  "/api/concert",
  verifyToken,
  createProxyMiddleware({
    ...baseProxyOptions,
    target: CONCERT_SERVICE_URL,
    pathRewrite: {
      "^/api/concert": "concert", // Adjust according to your concert service path
    },
    logLevel: 'debug',
  })
);

app.use(
  "/api/booking",
  verifyToken,
  createProxyMiddleware({
    ...baseProxyOptions,
    target: BOOKING_SERVICE_URL,
    pathRewrite: {
      "^/api/booking": "booking", // Adjust according to your booking service path
    },
    logLevel: 'debug',
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'service not found' });
});



app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
});
