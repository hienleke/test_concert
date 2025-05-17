import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { redisService } from '../event/redisService';
import { logger } from '@concert/shared';
import { redisClient_lib, getRedisClient } from '@concert/shared'
import { ITokenPayload, IAuthResponse, ILoginResponse } from '../types/auth.types'
type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;


export class AuthService {
  private static instance: AuthService;
  private readonly JWT_SECRET: string;
  private readonly TOKEN_EXPIRY = Number(process.env.JWT_EXPIRY) || 86400;
  public redisClient: RedisClientType | null = null;
  private constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'lekehien5431@gmail.com';
  }

  public static async getInstance(): Promise<AuthService> {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
      AuthService.instance.redisClient = await getRedisClient();
    }
    return AuthService.instance;
  }

  public async register(email: string, password: string, name: string): Promise<IAuthResponse<ILoginResponse>> {
    try {
      if (!this.redisClient) {
        return {
          success: false,
          error: 'Redis is not init'
        };
      }
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          success: false,
          error: 'User already exists'
        };
      }
      // Create new user
      const user = new User({ email, password, name });
      await user.save();

      return {
        success: true,
        data: {
          user: this.getUserResponse(user),
        }
      } as IAuthResponse<ILoginResponse>;
    } catch (error: any) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  public async login(email: string, password: string): Promise<IAuthResponse<ILoginResponse>> {
    try {
      if (!this.redisClient) {
        return {
          success: false,
          error: 'Redis is not inited'
        };
      }
      // Find user
      const usersession = await this.redisClient?.get(`session:${email}`);
      if (usersession) {
        return {
          success: false,
          error: 'User already logged in'
        };
      }

      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
      const tokens = await this.generateTokens(user);
      // Generate tokens
      await this.redisClient?.set(
        `session:${email}`,
        tokens.accessToken,
        {
          EX: this.TOKEN_EXPIRY
        }
      );

      await this.redisClient?.set(
        `token:${tokens.accessToken}`,
        user.email,
        {
          EX: this.TOKEN_EXPIRY
        }
      );

      return {
        success: true,
        data: {
          user: this.getUserResponse(user),
          ...tokens
        }
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  public async validateToken(token: string): Promise<IAuthResponse<ITokenPayload>> {
    try {
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        };
      }
      if (!this.redisClient) {
        return {
          success: false,
          error: 'Redis is not init'
        };
      }

      const useremail = await this.redisClient?.get(`token:${token}`);
      if (!useremail) {
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      }
      // Verify JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as ITokenPayload;

      return {
        success: true,
        data: decoded
      };
    } catch (error: any) {
      logger.error('Token validation error:', error);
      return {
        success: false,
        error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      };
    }
  }

  public async logout(token: string): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      if (!this.redisClient) {
        return false;
      }
      const email = await this.redisClient?.get(`token:${token}`);
      if (!email) {
        return false;
      }

      // Simply remove the token from Redis
      await this.redisClient?.del(`token:${token}`);
      await this.redisClient?.del(`session:${email}`);

      return true;
    } catch (error) {
      logger.error('Logout error:', error);
      return false;
    }
  }

  private async generateTokens(user: IUser) {
    const payload: ITokenPayload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY
    });

    return {
      accessToken
    };
  }
  private getUserResponse(user: IUser) {
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
