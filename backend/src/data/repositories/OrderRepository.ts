import { BaseRepository } from './BaseRepository.js';
import { Order, OrderFilters, PaginationParams, PaginationResult } from '../types.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export class OrderRepository extends BaseRepository<Order> {
  protected entityKey = 'order';
  protected entityName = 'Order';

  protected matchesSearchPattern(entity: Order, pattern: string): boolean {
    const searchPattern = pattern.toLowerCase();
    return (
      entity.status.toLowerCase().includes(searchPattern) ||
      entity.paymentMethod.toLowerCase().includes(searchPattern)
    );
  }

  // Find orders by customer
  async findByCustomer(customerId: string, params: PaginationParams): Promise<PaginationResult<Order>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
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
      
      const orders: Order[] = [];
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
    } catch (error) {
      logger.error('Order customer ile bulma hatası', { error: (error as Error).message, customerId });
      throw error;
    }
  }

  // Find orders by restaurant
  async findByRestaurant(restaurantId: string, params: PaginationParams): Promise<PaginationResult<Order>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
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
      
      const orders: Order[] = [];
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
    } catch (error) {
      logger.error('Order restaurant ile bulma hatası', { error: (error as Error).message, restaurantId });
      throw error;
    }
  }

  // Find orders by status
  async findByStatus(status: string, params: PaginationParams): Promise<PaginationResult<Order>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
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
      
      const orders: Order[] = [];
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
    } catch (error) {
      logger.error('Order status ile bulma hatası', { error: (error as Error).message, status });
      throw error;
    }
  }

  // Find orders with filters
  async findWithFilters(filters: OrderFilters, params: PaginationParams): Promise<PaginationResult<Order>> {
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
    } catch (error) {
      logger.error('Order filtre ile bulma hatası', { error: (error as Error).message, filters });
      throw error;
    }
  }

  // Get order statistics
  async getStats(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    byPaymentMethod: { [key: string]: number };
    totalRevenue: number;
    lastCreated: Date | null;
  }> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const byStatus: { [key: string]: number } = {};
      const byPaymentMethod: { [key: string]: number } = {};
      let totalRevenue = 0;
      let lastCreated: Date | null = null;
      
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
    } catch (error) {
      logger.error('Order istatistik hatası', { error: (error as Error).message });
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
