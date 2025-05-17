"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNELS = exports.runLuaScript = exports.redisStreamOperations = exports.getRedisClient = exports.redisClient_lib = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
const redis = __importStar(require("redis"));
exports.redisClient_lib = redis;
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL ||
    "redis://default:yQinoHmX0GSKOBTuZz7Enp4vXUd9NcWg@redis-18609.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com:18609";
let redisClient = null;
const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = (0, redis_1.createClient)({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
                connectTimeout: 10000,
            },
        });
        redisClient.on("error", (err) => logger_1.logger.error("Redis Client Error:", err));
        redisClient.on("connect", () => logger_1.logger.info("Redis client connected successfully"));
        redisClient.on("reconnecting", () => logger_1.logger.info("Redis client reconnecting..."));
        redisClient.on("end", () => {
            logger_1.logger.info("Redis client connection closed");
            redisClient = null;
        });
        await redisClient.connect();
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
exports.redisStreamOperations = {
    async publishToStream(streamName, message) {
        const client = await (0, exports.getRedisClient)();
        try {
            const messageId = await client.xAdd(streamName, '*', {
                data: JSON.stringify(message),
                timestamp: Date.now().toString(),
            });
            logger_1.logger.debug(`Published message to stream ${streamName}, ID: ${messageId}`);
            return messageId;
        }
        catch (error) {
            logger_1.logger.error(`Error publishing to stream ${streamName}:`, error);
        }
    },
    async readFromStream(streamName, lastId = '$') {
        const client = await (0, exports.getRedisClient)();
        try {
            const response = await client.xRead([{ key: streamName, id: lastId }], { BLOCK: 5000, COUNT: 10000 });
            if (!response)
                return [];
            const messages = response[0].messages.map((entry) => {
                const id = entry.id;
                const rawData = entry.message.data;
                let data = {};
                try {
                    data = JSON.parse(rawData);
                }
                catch (e) {
                    logger_1.logger.warn(`Could not parse message data for ID ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Error reading from stream ${streamName}:`, error);
            return [];
        }
    }
};
const runLuaScript = async (luaScript, key, lockId) => {
    // getRedisClient is singaleton
    const redisClient = await (0, exports.getRedisClient)();
    let result = await redisClient.eval(luaScript, { keys: [key], arguments: [lockId] });
    return result;
};
exports.runLuaScript = runLuaScript;
exports.CHANNELS = {
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
//# sourceMappingURL=redis.js.map