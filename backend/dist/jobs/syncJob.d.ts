export declare class SyncJob {
    private subgraphService;
    private oracleService;
    private jobs;
    constructor();
    start(): void;
    stop(): void;
    private startSubgraphSyncJob;
    private startOracleUpdateJob;
    private startDailyCleanupJob;
    private startExternalPriceFetchJob;
    manualSubgraphSync(): Promise<void>;
    manualOracleUpdate(): Promise<void>;
    private performDailyCleanup;
    private cleanupOldLogs;
    private cleanupOldPriceUpdates;
    private optimizeDatabase;
    private fetchExternalPrices;
    getJobStatuses(): Array<{
        name: string;
        status: string;
        nextRun: Date | null;
    }>;
    private getJobName;
    healthCheck(): Promise<{
        subgraph: boolean;
        oracle: boolean;
        jobs: number;
        status: 'healthy' | 'unhealthy';
    }>;
}
//# sourceMappingURL=syncJob.d.ts.map