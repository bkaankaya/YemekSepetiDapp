import { BaseRepository } from './BaseRepository.js';
import { Order, OrderFilters, PaginationParams, PaginationResult } from '../types.js';
export declare class OrderRepository extends BaseRepository<Order> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: Order, pattern: string): boolean;
    findByCustomer(customerId: string, params: PaginationParams): Promise<PaginationResult<Order>>;
    findByRestaurant(restaurantId: string, params: PaginationParams): Promise<PaginationResult<Order>>;
    findByStatus(status: string, params: PaginationParams): Promise<PaginationResult<Order>>;
    findWithFilters(filters: OrderFilters, params: PaginationParams): Promise<PaginationResult<Order>>;
    getStats(): Promise<{
        total: number;
        byStatus: {
            [key: string]: number;
        };
        byPaymentMethod: {
            [key: string]: number;
        };
        totalRevenue: number;
        lastCreated: Date | null;
    }>;
}
//# sourceMappingURL=OrderRepository.d.ts.map