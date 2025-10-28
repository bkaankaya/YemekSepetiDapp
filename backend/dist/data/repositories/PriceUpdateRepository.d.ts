import { BaseRepository } from './BaseRepository.js';
import { PriceUpdate, PriceUpdateFilters, PaginationParams, PaginationResult } from '../types.js';
export declare class PriceUpdateRepository extends BaseRepository<PriceUpdate> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: PriceUpdate, pattern: string): boolean;
    findByTokenAddress(tokenAddress: string, params: PaginationParams): Promise<PaginationResult<PriceUpdate>>;
    findBySource(source: string, params: PaginationParams): Promise<PaginationResult<PriceUpdate>>;
    findByDateRange(startDate: Date, endDate: Date, params: PaginationParams): Promise<PaginationResult<PriceUpdate>>;
    findWithFilters(filters: PriceUpdateFilters, params: PaginationParams): Promise<PaginationResult<PriceUpdate>>;
    getLatestPrice(tokenAddress?: string): Promise<PriceUpdate | null>;
    getPriceHistory(tokenAddress?: string, limit?: number): Promise<PriceUpdate[]>;
    getStats(): Promise<{
        total: number;
        bySource: {
            [key: string]: number;
        };
        byToken: {
            [key: string]: number;
        };
        lastUpdate: Date | null;
    }>;
    cleanOldPriceUpdates(daysOld: number): Promise<number>;
}
//# sourceMappingURL=PriceUpdateRepository.d.ts.map