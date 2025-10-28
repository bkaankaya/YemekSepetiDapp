import { redisDatabase } from '../../config/database.js';
import { BaseEntity, PaginationParams, PaginationResult } from '../types.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract entityKey: string;
  protected abstract entityName: string;

  protected getKey(id: string): string {
    return redisDatabase.createKey(`${this.entityKey}:${id}`);
  }

  protected getIndexKey(): string {
    return redisDatabase.createKey(`${this.entityKey}:${this.entityKey}_index`);
  }

  protected getSearchKey(): string {
    return redisDatabase.createKey(`${this.entityKey}:search`);
  }

  // Create or update entity
  async save(entity: T): Promise<T> {
    try {
      const key = this.getKey(entity.id);
      const data = JSON.stringify(entity);
      
      await redisDatabase.getClient().set(key, data);
      
      // Add to index
      await this.addToIndex(entity.id);
      
      logger.debug(`${this.entityName} kaydedildi`, { id: entity.id });
      return entity;
    } catch (error) {
      logger.error(`${this.entityName} kaydetme hatası`, { error: (error as Error).message, id: entity.id });
      throw error;
    }
  }

  // Find entity by ID
  async findById(id: string): Promise<T | null> {
    try {
      const key = this.getKey(id);
      const data = await redisDatabase.getClient().get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`${this.entityName} bulma hatası`, { error: (error as Error).message, id });
      return null;
    }
  }

  // Find all entities with pagination
  async findAll(params: PaginationParams): Promise<PaginationResult<T>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const total = allIds.length;
      const start = params.skip;
      const end = params.skip + params.limit;
      const pageIds = allIds.slice(start, end);
      
      const entities: T[] = [];
      for (const id of pageIds) {
        const entity = await this.findById(id);
        if (entity) {
          entities.push(entity);
        }
      }
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: entities,
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
      logger.error(`${this.entityName} listeleme hatası`, { error: (error as Error).message });
      throw error;
    }
  }

  // Delete entity
  async delete(id: string): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await redisDatabase.getClient().del(key);
      
      if (result > 0) {
        // Remove from index
        await this.removeFromIndex(id);
        logger.debug(`${this.entityName} silindi`, { id });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`${this.entityName} silme hatası`, { error: (error as Error).message, id });
      return false;
    }
  }

  // Count total entities
  async count(): Promise<number> {
    try {
      const indexKey = this.getIndexKey();
      return await redisDatabase.getClient().sCard(indexKey);
    } catch (error) {
      logger.error(`${this.entityName} sayma hatası`, { error: (error as Error).message });
      return 0;
    }
  }

  // Check if entity exists
  async exists(id: string): Promise<boolean> {
    try {
      const key = this.getKey(id);
      return await redisDatabase.getClient().exists(key) > 0;
    } catch (error) {
      logger.error(`${this.entityName} varlık kontrolü hatası`, { error: (error as Error).message, id });
      return false;
    }
  }

  // Add entity to index
  private async addToIndex(id: string): Promise<void> {
    try {
      const indexKey = this.getIndexKey();
      await redisDatabase.getClient().sAdd(indexKey, id);
    } catch (error) {
      logger.error(`${this.entityName} index ekleme hatası`, { error: (error as Error).message, id });
    }
  }

  // Remove entity from index
  private async removeFromIndex(id: string): Promise<void> {
    try {
      const indexKey = this.getIndexKey();
      await redisDatabase.getClient().sRem(indexKey, id);
    } catch (error) {
      logger.error(`${this.entityName} index silme hatası`, { error: (error as Error).message, id });
    }
  }

  // Search entities by pattern
  async search(pattern: string, params: PaginationParams): Promise<PaginationResult<T>> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      const matchingIds: string[] = [];
      
      // Simple search implementation - in production, you might want to use Redis Search
      for (const id of allIds) {
        const entity = await this.findById(id);
        if (entity && this.matchesSearchPattern(entity, pattern)) {
          matchingIds.push(id);
        }
      }
      
      const total = matchingIds.length;
      const start = params.skip;
      const end = params.skip + params.limit;
      const pageIds = matchingIds.slice(start, end);
      
      const entities: T[] = [];
      for (const id of pageIds) {
        const entity = await this.findById(id);
        if (entity) {
          entities.push(entity);
        }
      }
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: entities,
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
      logger.error(`${this.entityName} arama hatası`, { error: (error as Error).message, pattern });
      throw error;
    }
  }

  // Abstract method for search pattern matching
  protected abstract matchesSearchPattern(entity: T, pattern: string): boolean;

  // Bulk operations
  async saveMany(entities: T[]): Promise<T[]> {
    try {
      const pipeline = redisDatabase.getClient().multi();
      
      for (const entity of entities) {
        const key = this.getKey(entity.id);
        const data = JSON.stringify(entity);
        pipeline.set(key, data);
        pipeline.sAdd(this.getIndexKey(), entity.id);
      }
      
      await pipeline.exec();
      
      logger.debug(`${entities.length} ${this.entityName} toplu kaydedildi`);
      return entities;
    } catch (error) {
      logger.error(`${this.entityName} toplu kaydetme hatası`, { error: (error as Error).message });
      throw error;
    }
  }

  // Clear all entities (dangerous operation)
  async clearAll(): Promise<void> {
    try {
      const indexKey = this.getIndexKey();
      const allIds = await redisDatabase.getClient().sMembers(indexKey);
      
      if (allIds.length > 0) {
        const pipeline = redisDatabase.getClient().multi();
        
        for (const id of allIds) {
          pipeline.del(this.getKey(id));
        }
        
        pipeline.del(indexKey);
        await pipeline.exec();
        
        logger.warn(`Tüm ${this.entityName} kayıtları silindi`, { count: allIds.length });
      }
    } catch (error) {
      logger.error(`${this.entityName} toplu silme hatası`, { error: (error as Error).message });
      throw error;
    }
  }
}
