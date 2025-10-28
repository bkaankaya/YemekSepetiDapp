import { BaseRepository } from './BaseRepository.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
export class MenuItemRepository extends BaseRepository {
    constructor() {
        super(...arguments);
        this.entityKey = 'menu_item';
        this.entityName = 'MenuItem';
    }
    matchesSearchPattern(entity, pattern) {
        const searchPattern = pattern.toLowerCase();
        return (entity.name.toLowerCase().includes(searchPattern) ||
            entity.description.toLowerCase().includes(searchPattern) ||
            entity.category.toLowerCase().includes(searchPattern));
    }
    // Find menu items by restaurant
    async findByRestaurant(restaurantId, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const menuItem = await this.findById(id);
                if (menuItem && menuItem.restaurantId === restaurantId) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const menuItems = [];
            for (const id of pageIds) {
                const menuItem = await this.findById(id);
                if (menuItem) {
                    menuItems.push(menuItem);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: menuItems,
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
            logger.error('MenuItem restaurant ile bulma hatası', { error: error.message, restaurantId });
            throw error;
        }
    }
    // Find available menu items
    async findAvailable(params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const availableIds = [];
            for (const id of allIds) {
                const menuItem = await this.findById(id);
                if (menuItem && menuItem.isAvailable) {
                    availableIds.push(id);
                }
            }
            const total = availableIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = availableIds.slice(start, end);
            const menuItems = [];
            for (const id of pageIds) {
                const menuItem = await this.findById(id);
                if (menuItem) {
                    menuItems.push(menuItem);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: menuItems,
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
            logger.error('Mevcut menu item bulma hatası', { error: error.message });
            throw error;
        }
    }
    // Find menu items by category
    async findByCategory(category, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const menuItem = await this.findById(id);
                if (menuItem && menuItem.category.toLowerCase() === category.toLowerCase()) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const menuItems = [];
            for (const id of pageIds) {
                const menuItem = await this.findById(id);
                if (menuItem) {
                    menuItems.push(menuItem);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: menuItems,
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
            logger.error('MenuItem kategori ile bulma hatası', { error: error.message, category });
            throw error;
        }
    }
    // Find menu items with filters
    async findWithFilters(filters, params) {
        try {
            if (filters.search) {
                return await this.search(filters.search, params);
            }
            if (filters.restaurantId) {
                return await this.findByRestaurant(filters.restaurantId, params);
            }
            if (filters.category) {
                return await this.findByCategory(filters.category, params);
            }
            if (filters.isAvailable !== undefined) {
                if (filters.isAvailable) {
                    return await this.findAvailable(params);
                }
            }
            return await this.findAll(params);
        }
        catch (error) {
            logger.error('MenuItem filtre ile bulma hatası', { error: error.message, filters });
            throw error;
        }
    }
    // Get menu item statistics
    async getStats() {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            let available = 0;
            const byCategory = {};
            const byRestaurant = {};
            let lastCreated = null;
            for (const id of allIds) {
                const menuItem = await this.findById(id);
                if (menuItem) {
                    if (menuItem.isAvailable)
                        available++;
                    byCategory[menuItem.category] = (byCategory[menuItem.category] || 0) + 1;
                    byRestaurant[menuItem.restaurantId] = (byRestaurant[menuItem.restaurantId] || 0) + 1;
                    if (!lastCreated || menuItem.createdAt > lastCreated) {
                        lastCreated = menuItem.createdAt;
                    }
                }
            }
            return {
                total: allIds.length,
                available,
                byCategory,
                byRestaurant,
                lastCreated
            };
        }
        catch (error) {
            logger.error('MenuItem istatistik hatası', { error: error.message });
            return {
                total: 0,
                available: 0,
                byCategory: {},
                byRestaurant: {},
                lastCreated: null
            };
        }
    }
}
//# sourceMappingURL=MenuItemRepository.js.map