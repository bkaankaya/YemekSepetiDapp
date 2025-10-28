import { BaseRepository } from './BaseRepository.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
export class RestaurantRepository extends BaseRepository {
    constructor() {
        super(...arguments);
        this.entityKey = 'restaurant';
        this.entityName = 'Restaurant';
    }
    matchesSearchPattern(entity, pattern) {
        const searchPattern = pattern.toLowerCase();
        return (entity.name.toLowerCase().includes(searchPattern) ||
            entity.description.toLowerCase().includes(searchPattern) ||
            entity.cuisine.toLowerCase().includes(searchPattern));
    }
    // Find restaurant by address
    async findByAddress(address) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            for (const id of allIds) {
                const restaurant = await this.findById(id);
                if (restaurant && restaurant.address.toLowerCase() === address.toLowerCase()) {
                    return restaurant;
                }
            }
            return null;
        }
        catch (error) {
            logger.error('Restaurant adres ile bulma hatası', { error: error.message, address });
            return null;
        }
    }
    // Find restaurants by cuisine
    async findByCuisine(cuisine, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const restaurant = await this.findById(id);
                if (restaurant && restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const restaurants = [];
            for (const id of pageIds) {
                const restaurant = await this.findById(id);
                if (restaurant) {
                    restaurants.push(restaurant);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: restaurants,
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
            logger.error('Restaurant mutfak ile bulma hatası', { error: error.message, cuisine });
            throw error;
        }
    }
    // Find active restaurants
    async findActive(params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const activeIds = [];
            for (const id of allIds) {
                const restaurant = await this.findById(id);
                if (restaurant && restaurant.isActive) {
                    activeIds.push(id);
                }
            }
            const total = activeIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = activeIds.slice(start, end);
            const restaurants = [];
            for (const id of pageIds) {
                const restaurant = await this.findById(id);
                if (restaurant) {
                    restaurants.push(restaurant);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: restaurants,
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
            logger.error('Aktif restaurant bulma hatası', { error: error.message });
            throw error;
        }
    }
    // Find restaurants that accept tokens
    async findTokenAccepting(params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const tokenAcceptingIds = [];
            for (const id of allIds) {
                const restaurant = await this.findById(id);
                if (restaurant && restaurant.acceptsTokens) {
                    tokenAcceptingIds.push(id);
                }
            }
            const total = tokenAcceptingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = tokenAcceptingIds.slice(start, end);
            const restaurants = [];
            for (const id of pageIds) {
                const restaurant = await this.findById(id);
                if (restaurant) {
                    restaurants.push(restaurant);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: restaurants,
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
            logger.error('Token kabul eden restaurant bulma hatası', { error: error.message });
            throw error;
        }
    }
    // Find restaurants with filters
    async findWithFilters(filters, params) {
        try {
            if (filters.search) {
                return await this.search(filters.search, params);
            }
            if (filters.cuisine) {
                return await this.findByCuisine(filters.cuisine, params);
            }
            if (filters.isActive !== undefined) {
                if (filters.isActive) {
                    return await this.findActive(params);
                }
                else {
                    // Find inactive restaurants
                    const indexKey = this.getIndexKey();
                    const allIds = await redisDatabase.getClient().sMembers(indexKey);
                    const inactiveIds = [];
                    for (const id of allIds) {
                        const restaurant = await this.findById(id);
                        if (restaurant && !restaurant.isActive) {
                            inactiveIds.push(id);
                        }
                    }
                    const total = inactiveIds.length;
                    const start = params.skip;
                    const end = params.skip + params.limit;
                    const pageIds = inactiveIds.slice(start, end);
                    const restaurants = [];
                    for (const id of pageIds) {
                        const restaurant = await this.findById(id);
                        if (restaurant) {
                            restaurants.push(restaurant);
                        }
                    }
                    const totalPages = Math.ceil(total / params.limit);
                    return {
                        data: restaurants,
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
            if (filters.acceptsTokens !== undefined) {
                if (filters.acceptsTokens) {
                    return await this.findTokenAccepting(params);
                }
                else {
                    // Find restaurants that don't accept tokens
                    const indexKey = this.getIndexKey();
                    const allIds = await redisDatabase.getClient().sMembers(indexKey);
                    const nonTokenAcceptingIds = [];
                    for (const id of allIds) {
                        const restaurant = await this.findById(id);
                        if (restaurant && !restaurant.acceptsTokens) {
                            nonTokenAcceptingIds.push(id);
                        }
                    }
                    const total = nonTokenAcceptingIds.length;
                    const start = params.skip;
                    const end = params.skip + params.limit;
                    const pageIds = nonTokenAcceptingIds.slice(start, end);
                    const restaurants = [];
                    for (const id of pageIds) {
                        const restaurant = await this.findById(id);
                        if (restaurant) {
                            restaurants.push(restaurant);
                        }
                    }
                    const totalPages = Math.ceil(total / params.limit);
                    return {
                        data: restaurants,
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
            logger.error('Restaurant filtre ile bulma hatası', { error: error.message, filters });
            throw error;
        }
    }
    // Get restaurant statistics
    async getStats() {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            let active = 0;
            let tokenAccepting = 0;
            const cuisines = {};
            let lastCreated = null;
            for (const id of allIds) {
                const restaurant = await this.findById(id);
                if (restaurant) {
                    if (restaurant.isActive)
                        active++;
                    if (restaurant.acceptsTokens)
                        tokenAccepting++;
                    cuisines[restaurant.cuisine] = (cuisines[restaurant.cuisine] || 0) + 1;
                    if (!lastCreated || restaurant.createdAt > lastCreated) {
                        lastCreated = restaurant.createdAt;
                    }
                }
            }
            return {
                total: allIds.length,
                active,
                tokenAccepting,
                cuisines,
                lastCreated
            };
        }
        catch (error) {
            logger.error('Restaurant istatistik hatası', { error: error.message });
            return {
                total: 0,
                active: 0,
                tokenAccepting: 0,
                cuisines: {},
                lastCreated: null
            };
        }
    }
}
//# sourceMappingURL=RestaurantRepository.js.map