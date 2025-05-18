import { RedisClientType } from "redis";
import * as redis from "redis";
export declare const redisClient_lib: typeof redis;
export declare const getRedisClient: () => Promise<RedisClientType>;
export declare const redisStreamOperations: {
    publishToStream(streamName: string, message: any): Promise<string | undefined>;
    readFromStream(streamName: string, lastId?: string): Promise<{
        id: string;
        data: {};
        timestamp: string;
    }[]>;
};
export declare const runLuaScript: (luaScript: string, key: string, lockId: string) => Promise<any>;
export declare const CHANNELS: {
    AUTH: {
        USER_CREATED: string;
        USER_UPDATED: string;
        USER_DELETED: string;
        TOKEN_VALIDATION: string;
    };
    BOOKING: {
        CREATED: string;
        UPDATED: string;
        DELETED: string;
        VALIDATED: string;
        ACTION: string;
    };
    CONCERT: {
        CREATED: string;
        UPDATED: string;
        DELETED: string;
        READED: string;
        AVAILABILITY_CHANGED: string;
    };
};
