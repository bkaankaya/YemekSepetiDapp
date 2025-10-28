import { BaseRepository } from './BaseRepository.js';
import { Restaurant, RestaurantFilters, PaginationParams, PaginationResult } from '../types.js';
export declare class RestaurantRepository extends BaseRepository<Restaurant> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: Restaurant, pattern: string): boolean;
    findByAddress(address: string): Promise<Restaurant | null>;
    findByCuisine(cuisine: string, params: PaginationParams): Promise<PaginationResult<Restaurant>>;
    findActive(params: PaginationParams): Promise<PaginationResult<Restaurant>>;
    findTokenAccepting(params: PaginationParams): Promise<PaginationResult<Restaurant>>;
    findWithFilters(filters: RestaurantFilters, params: PaginationParams): Promise<PaginationResult<Restaurant>>;
    getStats(): Promise<{
        total: number;
        active: number;
        tokenAccepting: number;
        cuisines: {
            [key: string]: number;
        };
        lastCreated: Date | null;
    }>;
}
//# sourceMappingURL=RestaurantRepository.d.ts.map