import { BaseRepository } from './BaseRepository.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
export class UserRepository extends BaseRepository {
    constructor() {
        super(...arguments);
        this.entityKey = 'user';
        this.entityName = 'User';
    }
    matchesSearchPattern(entity, pattern) {
        const searchPattern = pattern.toLowerCase();
        return (entity.username.toLowerCase().includes(searchPattern) ||
            entity.email.toLowerCase().includes(searchPattern));
    }
    // Find user by username
    async findByUsername(username) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            for (const id of allIds) {
                const user = await this.findById(id);
                if (user && user.username.toLowerCase() === username.toLowerCase()) {
                    return user;
                }
            }
            return null;
        }
        catch (error) {
            logger.error('User kullanıcı adı ile bulma hatası', { error: error.message, username });
            return null;
        }
    }
    // Find user by email
    async findByEmail(email) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            for (const id of allIds) {
                const user = await this.findById(id);
                if (user && user.email.toLowerCase() === email.toLowerCase()) {
                    return user;
                }
            }
            return null;
        }
        catch (error) {
            logger.error('User email ile bulma hatası', { error: error.message, email });
            return null;
        }
    }
    // Find users by role
    async findByRole(role, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const user = await this.findById(id);
                if (user && user.role === role) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const users = [];
            for (const id of pageIds) {
                const user = await this.findById(id);
                if (user) {
                    users.push(user);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: users,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    totalPages,
                    hasNext: params.page < totalPages,
                    hasPrev: params.page > 1
                }
            };
        }
        catch (error) {
            logger.error('User rol ile bulma hatası', { error: error.message, role });
            throw error;
        }
    }
    // Find active users
    async findActive(params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const activeIds = [];
            for (const id of allIds) {
                const user = await this.findById(id);
                if (user && user.isActive) {
                    activeIds.push(id);
                }
            }
            const total = activeIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = activeIds.slice(start, end);
            const users = [];
            for (const id of pageIds) {
                const user = await this.findById(id);
                if (user) {
                    users.push(user);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: users,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    totalPages,
                    hasNext: params.page < totalPages,
                    hasPrev: params.page > 1
                }
            };
        }
        catch (error) {
            logger.error('Aktif user bulma hatası', { error: error.message });
            throw error;
        }
    }
    // Find users with filters
    async findWithFilters(filters, params) {
        try {
            if (filters.role) {
                return await this.findByRole(filters.role, params);
            }
            if (filters.isActive !== undefined) {
                if (filters.isActive) {
                    return await this.findActive(params);
                }
                else {
                    // Find inactive users
                    const indexKey = this.getIndexKey();
                    const allIds = await redisDatabase.getClient().sMembers(indexKey);
                    const inactiveIds = [];
                    for (const id of allIds) {
                        const user = await this.findById(id);
                        if (user && !user.isActive) {
                            inactiveIds.push(id);
                        }
                    }
                    const total = inactiveIds.length;
                    const start = params.skip;
                    const end = params.skip + params.limit;
                    const pageIds = inactiveIds.slice(start, end);
                    const users = [];
                    for (const id of pageIds) {
                        const user = await this.findById(id);
                        if (user) {
                            users.push(user);
                        }
                    }
                    const totalPages = Math.ceil(total / params.limit);
                    return {
                        data: users,
                        pagination: {
                            page: params.page,
                            limit: params.limit,
                            total,
                            totalPages,
                            hasNext: params.page < totalPages,
                            hasPrev: params.page > 1
                        }
                    };
                }
            }
            return await this.findAll(params);
        }
        catch (error) {
            logger.error('User filtre ile bulma hatası', { error: error.message, filters });
            throw error;
        }
    }
    // Update user last login
    async updateLastLogin(userId) {
        try {
            const user = await this.findById(userId);
            if (user) {
                user.lastLogin = new Date();
                await this.save(user);
                logger.debug('User son giriş zamanı güncellendi', { userId });
            }
        }
        catch (error) {
            logger.error('User son giriş güncelleme hatası', { error: error.message, userId });
        }
    }
    // Deactivate user
    async deactivateUser(userId) {
        try {
            const user = await this.findById(userId);
            if (user) {
                user.isActive = false;
                await this.save(user);
                logger.info('User deaktif edildi', { userId, username: user.username });
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('User deaktif etme hatası', { error: error.message, userId });
            return false;
        }
    }
    // Activate user
    async activateUser(userId) {
        try {
            const user = await this.findById(userId);
            if (user) {
                user.isActive = true;
                await this.save(user);
                logger.info('User aktif edildi', { userId, username: user.username });
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('User aktif etme hatası', { error: error.message, userId });
            return false;
        }
    }
    // Change user role
    async changeUserRole(userId, newRole) {
        try {
            const user = await this.findById(userId);
            if (user) {
                const oldRole = user.role;
                user.role = newRole;
                await this.save(user);
                logger.info('User rolü değiştirildi', { userId, username: user.username, oldRole, newRole });
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('User rol değiştirme hatası', { error: error.message, userId, newRole });
            return false;
        }
    }
    // Get user statistics
    async getStats() {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            let active = 0;
            const byRole = {};
            let lastCreated = null;
            let lastLogin = null;
            for (const id of allIds) {
                const user = await this.findById(id);
                if (user) {
                    if (user.isActive)
                        active++;
                    byRole[user.role] = (byRole[user.role] || 0) + 1;
                    if (!lastCreated || user.createdAt > lastCreated) {
                        lastCreated = user.createdAt;
                    }
                    if (user.lastLogin && (!lastLogin || user.lastLogin > lastLogin)) {
                        lastLogin = user.lastLogin;
                    }
                }
            }
            return {
                total: allIds.length,
                active,
                byRole,
                lastCreated,
                lastLogin
            };
        }
        catch (error) {
            logger.error('User istatistik hatası', { error: error.message });
            return {
                total: 0,
                active: 0,
                byRole: {},
                lastCreated: null,
                lastLogin: null
            };
        }
    }
    // Check if username exists
    async usernameExists(username) {
        try {
            const existingUser = await this.findByUsername(username);
            return existingUser !== null;
        }
        catch (error) {
            logger.error('Username varlık kontrolü hatası', { error: error.message, username });
            return false;
        }
    }
    // Check if email exists
    async emailExists(email) {
        try {
            const existingUser = await this.findByEmail(email);
            return existingUser !== null;
        }
        catch (error) {
            logger.error('Email varlık kontrolü hatası', { error: error.message, email });
            return false;
        }
    }
}
//# sourceMappingURL=UserRepository.js.map