import { BaseRepository } from './BaseRepository.js';
import { PriceUpdate, PriceUpdateFilters, PaginationParams, PaginationResult } from '../types.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export class PriceUpdateRepository extends BaseRepository<PriceUpdate> {
  protected entityKey = 'price_update';
  protected entityName = 'PriceUpdate';

  protected matchesSearchPattern(entity: PriceUpdate, pattern: string): boolean {
    const searchPattern = pattern.toLowerCase();
    return (
      entity.source.toLowerCase().includes(searchPattern) ||
      entity.updatedBy.toLowerCase().includes(searchPattern) ||
      (entity.tokenAddress ? entity.tokenAddress.toLowerCase().includes(searchPattern) : false)
    );
  }

  // Find price updates by token address
  async findByTokenAddress(tokenAddress: string, params: PaginationParams): Promise<PaginationResult<PriceUpdate>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate && priceUpdate.tokenAddress === tokenAddress) {
          matchingIds.push(id);
        }
      }
      
      const total = matchingIds.length;
      const start = params.skip;
      const end = params.skip + params.limit;
      const pageIds = matchingIds.slice(start, end);
      
      const priceUpdates: PriceUpdate[] = [];
      for (const id of pageIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          priceUpdates.push(priceUpdate);
        }
      }
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: priceUpdates,
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
      logger.error('PriceUpdate token adres ile bulma hatası', { error: (error as Error).message, tokenAddress });
      throw error;
    }
  }

  // Find price updates by source
  async findBySource(source: string, params: PaginationParams): Promise<PaginationResult<PriceUpdate>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate && priceUpdate.source.toLowerCase() === source.toLowerCase()) {
          matchingIds.push(id);
        }
      }
      
      const total = matchingIds.length;
      const start = params.skip;
      const end = params.skip + params.limit;
      const pageIds = matchingIds.slice(start, end);
      
      const priceUpdates: PriceUpdate[] = [];
      for (const id of pageIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          priceUpdates.push(priceUpdate);
        }
      }
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: priceUpdates,
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
      logger.error('PriceUpdate kaynak ile bulma hatası', { error: (error as Error).message, source });
      throw error;
    }
  }

  // Find price updates by date range
  async findByDateRange(startDate: Date, endDate: Date, params: PaginationParams): Promise<PaginationResult<PriceUpdate>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate && priceUpdate.createdAt >= startDate && priceUpdate.createdAt <= endDate) {
          matchingIds.push(id);
        }
      }
      
      const total = matchingIds.length;
      const start = params.skip;
      const end = params.skip + params.limit;
      const pageIds = matchingIds.slice(start, end);
      
      const priceUpdates: PriceUpdate[] = [];
      for (const id of pageIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          priceUpdates.push(priceUpdate);
        }
      }
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: priceUpdates,
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
      logger.error('PriceUpdate tarih aralığı ile bulma hatası', { error: (error as Error).message, startDate, endDate });
      throw error;
    }
  }

  // Find price updates with filters
  async findWithFilters(filters: PriceUpdateFilters, params: PaginationParams): Promise<PaginationResult<PriceUpdate>> {
    try {
      if (filters.tokenAddress) {
        return await this.findByTokenAddress(filters.tokenAddress, params);
      }
      
      if (filters.source) {
        return await this.findBySource(filters.source, params);
      }
      
      return await this.findAll(params);
    } catch (error) {
      logger.error('PriceUpdate filtre ile bulma hatası', { error: (error as Error).message, filters });
      throw error;
    }
  }

  // Get latest price for a token
  async getLatestPrice(tokenAddress?: string): Promise<PriceUpdate | null> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      let latestPriceUpdate: PriceUpdate | null = null;
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          if (tokenAddress) {
            if (priceUpdate.tokenAddress === tokenAddress) {
              if (!latestPriceUpdate || priceUpdate.createdAt > latestPriceUpdate.createdAt) {
                latestPriceUpdate = priceUpdate;
              }
            }
          } else {
            // For ETH price updates (no token address)
            if (!priceUpdate.tokenAddress) {
              if (!latestPriceUpdate || priceUpdate.createdAt > latestPriceUpdate.createdAt) {
                latestPriceUpdate = priceUpdate;
              }
            }
          }
        }
      }
      
      return latestPriceUpdate;
    } catch (error) {
      logger.error('En son fiyat bulma hatası', { error: (error as Error).message, tokenAddress });
      return null;
    }
  }

  // Get price history for a token
  async getPriceHistory(tokenAddress?: string, limit: number = 100): Promise<PriceUpdate[]> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingPriceUpdates: PriceUpdate[] = [];
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          if (tokenAddress) {
            if (priceUpdate.tokenAddress === tokenAddress) {
              matchingPriceUpdates.push(priceUpdate);
            }
          } else {
            // For ETH price updates (no token address)
            if (!priceUpdate.tokenAddress) {
              matchingPriceUpdates.push(priceUpdate);
            }
          }
        }
      }
      
      // Sort by creation date (newest first) and limit results
      return matchingPriceUpdates
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    } catch (error) {
      logger.error('Fiyat geçmişi bulma hatası', { error: (error as Error).message, tokenAddress });
      return [];
    }
  }

  // Get price update statistics
  async getStats(): Promise<{
    total: number;
    bySource: { [key: string]: number };
    byToken: { [key: string]: number };
    lastUpdate: Date | null;
  }> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const bySource: { [key: string]: number } = {};
      const byToken: { [key: string]: number } = {};
      let lastUpdate: Date | null = null;
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate) {
          bySource[priceUpdate.source] = (bySource[priceUpdate.source] || 0) + 1;
          
          const tokenKey = priceUpdate.tokenAddress || 'ETH';
          byToken[tokenKey] = (byToken[tokenKey] || 0) + 1;
          
          if (!lastUpdate || priceUpdate.createdAt > lastUpdate) {
            lastUpdate = priceUpdate.createdAt;
          }
        }
      }
      
      return {
        total: allIds.length,
        bySource,
        byToken,
        lastUpdate
      };
    } catch (error) {
      logger.error('PriceUpdate istatistik hatası', { error: (error as Error).message });
      return {
        total: 0,
        bySource: {},
        byToken: {},
        lastUpdate: null
      };
    }
  }

  // Clean old price updates (older than specified days)
  async cleanOldPriceUpdates(daysOld: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const toDelete: string[] = [];
      
      for (const id of allIds) {
        const priceUpdate = await this.findById(id);
        if (priceUpdate && priceUpdate.createdAt < cutoffDate) {
          toDelete.push(id);
        }
      }
      
      if (toDelete.length > 0) {
        const pipeline = redisDatabase.getClient().multi();
        
        for (const id of toDelete) {
          pipeline.del(this.getKey(id));
          pipeline.sRem(indexKey, id);
        }
        
        await pipeline.exec();
        
        logger.info(`${toDelete.length} eski fiyat güncellemesi temizlendi`, { cutoffDate });
      }
      
      return toDelete.length;
    } catch (error) {
      logger.error('Eski fiyat güncellemeleri temizleme hatası', { error: (error as Error).message, daysOld });
      return 0;
    }
  }
}
