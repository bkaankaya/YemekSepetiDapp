import { BaseRepository } from './BaseRepository.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
export class OrderRepository extends BaseRepository {
    constructor() {
        super(...arguments);
        this.entityKey = 'order';
        this.entityName = 'Order';
    }
    matchesSearchPattern(entity, pattern) {
        const searchPattern = pattern.toLowerCase();
        return (entity.status.toLowerCase().includes(searchPattern) ||
            entity.paymentMethod.toLowerCase().includes(searchPattern));
    }
    // Find orders by customer
    async findByCustomer(customerId, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const order = await this.findById(id);
                if (order && order.customerId === customerId) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const orders = [];
            for (const id of pageIds) {
                const order = await this.findById(id);
                if (order) {
                    orders.push(order);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: orders,
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
            logger.error('Order customer ile bulma hatası', { error: error.message, customerId });
            throw error;
        }
    }
    // Find orders by restaurant
    async findByRestaurant(restaurantId, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const order = await this.findById(id);
                if (order && order.restaurantId === restaurantId) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const orders = [];
            for (const id of pageIds) {
                const order = await this.findById(id);
                if (order) {
                    orders.push(order);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: orders,
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
            logger.error('Order restaurant ile bulma hatası', { error: error.message, restaurantId });
            throw error;
        }
    }
    // Find orders by status
    async findByStatus(status, params) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const matchingIds = [];
            for (const id of allIds) {
                const order = await this.findById(id);
                if (order && order.status === status) {
                    matchingIds.push(id);
                }
            }
            const total = matchingIds.length;
            const start = params.skip;
            const end = params.skip + params.limit;
            const pageIds = matchingIds.slice(start, end);
            const orders = [];
            for (const id of pageIds) {
                const order = await this.findById(id);
                if (order) {
                    orders.push(order);
                }
            }
            const totalPages = Math.ceil(total / params.limit);
            return {
                data: orders,
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
            logger.error('Order status ile bulma hatası', { error: error.message, status });
            throw error;
        }
    }
    // Find orders with filters
    async findWithFilters(filters, params) {
        try {
            if (filters.status) {
                return await this.findByStatus(filters.status, params);
            }
            if (filters.customerId) {
                return await this.findByCustomer(filters.customerId, params);
            }
            if (filters.restaurantId) {
                return await this.findByRestaurant(filters.restaurantId, params);
            }
            return await this.findAll(params);
        }
        catch (error) {
            logger.error('Order filtre ile bulma hatası', { error: error.message, filters });
            throw error;
        }
    }
    // Get order statistics
    async getStats() {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            const byStatus = {};
            const byPaymentMethod = {};
            let totalRevenue = 0;
            let lastCreated = null;
            for (const id of allIds) {
                const order = await this.findById(id);
                if (order) {
                    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
                    byPaymentMethod[order.paymentMethod] = (byPaymentMethod[order.paymentMethod] || 0) + 1;
                    totalRevenue += order.totalAmountUSD;
                    if (!lastCreated || order.createdAt > lastCreated) {
                        lastCreated = order.createdAt;
                    }
                }
            }
            return {
                total: allIds.length,
                byStatus,
                byPaymentMethod,
                totalRevenue,
                lastCreated
            };
        }
        catch (error) {
            logger.error('Order istatistik hatası', { error: error.message });
            return {
                total: 0,
                byStatus: {},
                byPaymentMethod: {},
                totalRevenue: 0,
                lastCreated: null
            };
        }
    }
}
//# sourceMappingURL=OrderRepository.js.map