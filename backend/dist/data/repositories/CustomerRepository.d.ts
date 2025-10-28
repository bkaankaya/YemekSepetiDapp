import { BaseRepository } from './BaseRepository.js';
import { Customer, CustomerFilters, PaginationParams, PaginationResult } from '../types.js';
export declare class CustomerRepository extends BaseRepository<Customer> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: Customer, pattern: string): boolean;
    findByAddress(address: string): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    findWithFilters(filters: CustomerFilters, params: PaginationParams): Promise<PaginationResult<Customer>>;
    getStats(): Promise<{
        total: number;
        active: number;
        lastCreated: Date | null;
    }>;
}
//# sourceMappingURL=CustomerRepository.d.ts.map