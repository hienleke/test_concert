import { redisClient_lib } from '@concert/shared';

export type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;

export type MessageHandler = (data: any) => Promise<any>;

export interface RequestOptions {
  timeout?: number; // in milliseconds
  streamName: string;
}

export interface RequestMessage {
  requestId: string;
  type: string;
  data: any;
  responseStream: string;
  timestamp: number;
}

export interface ResponseMessage {
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}
