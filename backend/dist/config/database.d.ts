import { RedisClientType } from 'redis';
export declare class RedisDatabase {
    private client;
    private isConnected;
    constructor();
    private setupEventHandlers;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType;
    isDatabaseConnected(): boolean;
    getKeyPrefix(): string;
    createKey(key: string): string;
    healthCheck(): Promise<boolean>;
}
export declare const redisDatabase: RedisDatabase;
export declare function initializeDatabase(): Promise<void>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map