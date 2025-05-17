import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name : string;
  };
}

// types.ts
export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  success: boolean;
  error?: string;
  data?: { user: any }; // Replace 'any' with a specific user type if known
}
