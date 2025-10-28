import { BaseRepository } from './BaseRepository.js';
import { User, UserRole, UserFilters, PaginationParams, PaginationResult } from '../types.js';
export declare class UserRepository extends BaseRepository<User> {
    protected entityKey: string;
    protected entityName: string;
    protected matchesSearchPattern(entity: User, pattern: string): boolean;
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByRole(role: UserRole, params: PaginationParams): Promise<PaginationResult<User>>;
    findActive(params: PaginationParams): Promise<PaginationResult<User>>;
    findWithFilters(filters: UserFilters, params: PaginationParams): Promise<PaginationResult<User>>;
    updateLastLogin(userId: string): Promise<void>;
    deactivateUser(userId: string): Promise<boolean>;
    activateUser(userId: string): Promise<boolean>;
    changeUserRole(userId: string, newRole: UserRole): Promise<boolean>;
    getStats(): Promise<{
        total: number;
        active: number;
        byRole: {
            [key: string]: number;
        };
        lastCreated: Date | null;
        lastLogin: Date | null;
    }>;
    usernameExists(username: string): Promise<boolean>;
    emailExists(email: string): Promise<boolean>;
}
//# sourceMappingURL=UserRepository.d.ts.map