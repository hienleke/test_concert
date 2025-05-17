export declare enum QUEUE_NAMES {
    EMAIL = "email-queue",
    CONCERT,
    AUTH
}
export interface IQueueJob {
    id: string;
    name: string;
    data: any;
    status: 'waiting' | 'active' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    createdAt: Date;
    finishedAt?: Date;
}
export interface IQueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}
