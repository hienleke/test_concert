import { IUser } from '../models/User';


export interface IAuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ILoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;

}

export interface IAuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
