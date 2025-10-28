import { BaseEntity, PaginationParams, PaginationResult } from '../types.js';
export declare abstract class BaseRepository<T extends BaseEntity> {
    protected abstract entityKey: string;
    protected abstract entityName: string;
    protected getKey(id: string): string;
    protected getIndexKey(): string;
    protected getSearchKey(): string;
    save(entity: T): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(params: PaginationParams): Promise<PaginationResult<T>>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
    exists(id: string): Promise<boolean>;
    private addToIndex;
    private removeFromIndex;
    search(pattern: string, params: PaginationParams): Promise<PaginationResult<T>>;
    protected abstract matchesSearchPattern(entity: T, pattern: string): boolean;
    saveMany(entities: T[]): Promise<T[]>;
    clearAll(): Promise<void>;
}
//# sourceMappingURL=BaseRepository.d.ts.map