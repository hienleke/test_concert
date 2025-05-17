import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import * as redis from "redis";
export const redisClient_lib = redis;

dotenv.config();

const REDIS_URL =
  process.env.REDIS_URL ||
  "redis://redis:6379";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
        connectTimeout: 10000,
      },
    });

    redisClient.on("error", (err: Error) =>
      logger.error("Redis Client Error:", err)
    );
    redisClient.on("connect", () =>
      logger.info("Redis client connected successfully")
    );
    redisClient.on("reconnecting", () =>
      logger.info("Redis client reconnecting...")
    );
    redisClient.on("end", () => {
      logger.info("Redis client connection closed");
      redisClient = null;
    });

    await redisClient.connect();
  }
  return redisClient;
};

export const redisStreamOperations = {
  async publishToStream(streamName: string, message: any) {
    const client = await getRedisClient();
    try {
      const messageId = await client.xAdd(streamName, '*', {
        data: JSON.stringify(message),
        timestamp: Date.now().toString(),
      });
      logger.debug(`Published message to stream ${streamName}, ID: ${messageId}`);
      return messageId;
    } catch (error) {
      logger.error(`Error publishing to stream ${streamName}:`, error);
    }
  },

  async readFromStream(streamName: string, lastId: string = '$') {
    const client = await getRedisClient();
    try {
      const response = await client.xRead(
        [{ key: streamName, id: lastId }],
        { BLOCK: 5000, COUNT: 10000 } 
      );

      if (!response) return [];

      const messages = response[0].messages.map((entry) => {
        const id = entry.id;
        const rawData = entry.message.data;
        let data = {};
        
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          logger.warn(`Could not parse message data for ID ${id}`);
        }

        return {
          id,
          data,
          timestamp: entry.message.timestamp,
        };
      });
      if (messages.length > 0) {
        await Promise.all(messages.map((message) => client.xDel(streamName, message.id)));
      }
      return messages;
    } catch (error) {
      logger.error(`Error reading from stream ${streamName}:`, error);
      return [];
    }
  }
};

export const runLuaScript = async (luaScript: string, key: string, lockId: string): Promise<any> => {
  // getRedisClient is singaleton
  const redisClient = await getRedisClient();
  let result  = await redisClient.eval(luaScript, { keys: [key], arguments: [lockId] });
  return result;
};

export const CHANNELS = {
  AUTH: {
    USER_CREATED: "auth:user:created",
    USER_UPDATED: "auth:user:updated",
    USER_DELETED: "auth:user:deleted",
    TOKEN_VALIDATION: "auth:token:validation",
  },
  BOOKING: {
    CREATED: "booking:created",
    UPDATED: "booking:updated",
    DELETED: "booking:deleted",
    VALIDATED: "booking:validated",
    ACTION: "booking:action",
  },
  CONCERT: {
    CREATED: "concert:created",
    UPDATED: "concert:updated",
    DELETED: "concert:deleted",
    READED: "concert:readed",
    AVAILABILITY_CHANGED: "concert:availability:changed",
   
  },
};
