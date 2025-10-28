import { BaseRepository } from './BaseRepository.js';
import { MenuItem, PaginationParams, PaginationResult } from '../types.js';
export declare class MenuItemRepository extends BaseRepository<MenuItem> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: MenuItem, pattern: string): boolean;
    findByRestaurant(restaurantId: string, params: PaginationParams): Promise<PaginationResult<MenuItem>>;
    findAvailable(params: PaginationParams): Promise<PaginationResult<MenuItem>>;
    findByCategory(category: string, params: PaginationParams): Promise<PaginationResult<MenuItem>>;
    findWithFilters(filters: any, params: PaginationParams): Promise<PaginationResult<MenuItem>>;
    getStats(): Promise<{
        total: number;
        available: number;
        byCategory: {
            [key: string]: number;
        };
        byRestaurant: {
            [key: string]: number;
        };
        lastCreated: Date | null;
    }>;
}
//# sourceMappingURL=MenuItemRepository.d.ts.map