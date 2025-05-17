type EventHandler<T = any> = (data: T) => void | Promise<void>;
export declare class PubSub {
    private static instance;
    private publisher;
    private subscriber;
    private subscriptions;
    private subscribedChannels;
    private isConnected;
    private connectionPromise;
    private redisUrl;
    private constructor();
    static getInstance(redisUrl?: string): PubSub;
    private setupEventListeners;
    connect(): Promise<void>;
    publish<T = any>(channel: string, data: T): Promise<number>;
    subscribe<T = any>(channel: string, handler: EventHandler<T>): Promise<void>;
    unsubscribe(channel: string, handler?: EventHandler): Promise<void>;
    close(): Promise<void>;
}
export declare const pubsub: PubSub;
export declare const createPubSub: (redisUrl?: string) => PubSub;
export {};
