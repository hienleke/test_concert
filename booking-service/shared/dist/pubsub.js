"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPubSub = exports.pubsub = exports.PubSub = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
class PubSub {
    constructor(redisUrl) {
        this.subscriptions = new Map();
        this.subscribedChannels = new Set();
        this.isConnected = false;
        this.connectionPromise = null;
        this.redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
        this.publisher = (0, redis_1.createClient)({ url: this.redisUrl });
        this.subscriber = this.publisher.duplicate();
        this.setupEventListeners();
    }
    static getInstance(redisUrl) {
        if (!PubSub.instance) {
            PubSub.instance = new PubSub(redisUrl);
        }
        return PubSub.instance;
    }
    setupEventListeners() {
        this.subscriber.on('message', (channel, message) => {
            try {
                const handlers = this.subscriptions.get(channel);
                if (handlers) {
                    const data = JSON.parse(message);
                    handlers.forEach(handler => {
                        try {
                            handler(data);
                        }
                        catch (error) {
                            logger_1.logger.error(`Error in event handler for channel ${channel}:`, error);
                        }
                    });
                }
            }
            catch (error) {
                logger_1.logger.error(`Error processing message on channel ${channel}:`, error);
            }
        });
        this.subscriber.on('error', (error) => {
            logger_1.logger.error('Redis subscriber error:', error);
            this.isConnected = false;
        });
        this.publisher.on('error', (error) => {
            logger_1.logger.error('Redis publisher error:', error);
            this.isConnected = false;
        });
    }
    async connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = (async () => {
            try {
                await Promise.all([
                    this.publisher.connect(),
                    this.subscriber.connect()
                ]);
                this.isConnected = true;
                logger_1.logger.info('Redis PubSub connected successfully');
            }
            catch (error) {
                logger_1.logger.error('Failed to connect to Redis:', error);
                throw error;
            }
        })();
        return this.connectionPromise;
    }
    async publish(channel, data) {
        if (!this.isConnected) {
            await this.connect();
        }
        const message = JSON.stringify(data);
        return this.publisher.publish(channel, message);
    }
    async subscribe(channel, handler) {
        if (!this.isConnected) {
            await this.connect();
        }
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, new Set());
            if (!this.subscribedChannels.has(channel)) {
                await this.subscriber.subscribe(channel, () => {
                    // Subscription confirmation
                });
                this.subscribedChannels.add(channel);
                logger_1.logger.info(`Subscribed to channel: ${channel}`);
            }
        }
        const handlers = this.subscriptions.get(channel);
        handlers.add(handler);
    }
    async unsubscribe(channel, handler) {
        if (!this.subscriptions.has(channel))
            return;
        if (handler) {
            const handlers = this.subscriptions.get(channel);
            handlers.delete(handler);
            if (handlers.size === 0) {
                await this.unsubscribe(channel);
            }
        }
        else {
            this.subscriptions.delete(channel);
            if (this.subscribedChannels.has(channel)) {
                await this.subscriber.unsubscribe(channel);
                this.subscribedChannels.delete(channel);
                logger_1.logger.info(`Unsubscribed from channel: ${channel}`);
            }
        }
    }
    async close() {
        try {
            await Promise.all([
                this.publisher.quit(),
                this.subscriber.quit()
            ]);
            this.isConnected = false;
            this.connectionPromise = null;
            logger_1.logger.info('Redis PubSub connection closed');
        }
        catch (error) {
            logger_1.logger.error('Error closing Redis PubSub connection:', error);
            throw error;
        }
    }
}
exports.PubSub = PubSub;
// Export a singleton instance
exports.pubsub = PubSub.getInstance();
// Helper function for creating a new PubSub instance
const createPubSub = (redisUrl) => {
    return PubSub.getInstance(redisUrl);
};
exports.createPubSub = createPubSub;
