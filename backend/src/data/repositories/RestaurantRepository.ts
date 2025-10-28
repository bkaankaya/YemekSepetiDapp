import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { Restaurant, PaginationParams, PaginationResult } from '../types.js';
import { BaseRepository } from './BaseRepository.js';

export class RestaurantRepository extends BaseRepository<Restaurant> {
  protected entityKey = 'restaurants';
  protected entityName = 'restaurants';

  // Abstract method implementation
  protected matchesSearchPattern(entity: Restaurant, pattern: string): boolean {
    const searchPattern = pattern.toLowerCase();
    return (
      entity.realWorldAddress.toLowerCase().includes(searchPattern) ||
      entity.walletAddress.toLowerCase().includes(searchPattern)
    );
  }

  // Wallet address ile restoran bul
  async findByWalletAddress(walletAddress: string): Promise<Restaurant | null> {
    try {
      const restaurantId = await redisDatabase.getClient().get(`yemeksepeti:restaurants:wallet:${walletAddress}`);
      if (!restaurantId) return null;
      
      return await this.findById(restaurantId);
    } catch (error) {
      logger.error('Restoran wallet address ile bulunamadı', { 
        error: (error as Error).message, 
        walletAddress 
      });
      return null;
    }
  }

  // Restoran kaydet (wallet address index'i de ekle)
  async save(restaurant: Restaurant): Promise<Restaurant> {
    try {
      const savedRestaurant = await super.save(restaurant);
      
      // Wallet address index'i ekle
      await redisDatabase.getClient().set(
        `yemeksepeti:restaurants:wallet:${restaurant.walletAddress}`, 
        restaurant.id
      );
      
      logger.info('Restoran kaydedildi', { id: restaurant.id, walletAddress: restaurant.walletAddress });
      return savedRestaurant;
    } catch (error) {
      logger.error('Restoran kaydetme hatası', { 
        error: (error as Error).message, 
        restaurant 
      });
      throw error;
    }
  }

  // Restoran güncelle
  async update(restaurant: Restaurant): Promise<Restaurant> {
    try {
      const updatedRestaurant = await super.save(restaurant);
      logger.info('Restoran güncellendi', { id: restaurant.id });
      return updatedRestaurant;
    } catch (error) {
      logger.error('Restoran güncelleme hatası', { 
        error: (error as Error).message, 
        restaurant 
      });
      throw error;
    }
  }

  // Restoran sil
  async delete(id: string): Promise<boolean> {
    try {
      const restaurant = await this.findById(id);
      if (restaurant) {
        // Wallet address index'ini sil
        await redisDatabase.getClient().del(`yemeksepeti:restaurants:wallet:${restaurant.walletAddress}`);
      }
      
      const result = await super.delete(id);
      logger.info('Restoran silindi', { id });
      return result;
    } catch (error) {
      logger.error('Restoran silme hatası', { 
        error: (error as Error).message, 
        id 
      });
      throw error;
    }
  }

  // Arama yap (BaseRepository ile uyumlu)
  async search(pattern: string, params: PaginationParams): Promise<PaginationResult<Restaurant>> {
    try {
      return await super.search(pattern, params);
    } catch (error) {
      logger.error('Restoran arama hatası', { 
        error: (error as Error).message, 
        pattern 
      });
      return {
        data: [],
        total: 0,
        page: params.page,
        limit: params.limit,
        totalPages: 0
      };
    }
  }

  // Basit arama (array döndürür)
  async searchSimple(query: string): Promise<Restaurant[]> {
    try {
      const allRestaurants = await this.findAll({ page: 1, limit: 1000, skip: 0 });
      return allRestaurants.data.filter(restaurant => 
        restaurant.realWorldAddress.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.walletAddress.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error('Restoran basit arama hatası', { 
        error: (error as Error).message, 
        query 
      });
      return [];
    }
  }

  // Filtreleme
  async findWithFilters(filters: any): Promise<Restaurant[]> {
    try {
      const allRestaurants = await this.findAll({ page: 1, limit: 1000, skip: 0 });
      let filtered = allRestaurants.data;

      if (filters.search) {
        filtered = filtered.filter(restaurant => 
          restaurant.realWorldAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
          restaurant.walletAddress.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.defaultSlippageBps !== undefined) {
        filtered = filtered.filter(restaurant => 
          restaurant.defaultSlippageBps === filters.defaultSlippageBps
        );
      }

      return filtered;
    } catch (error) {
      logger.error('Restoran filtreleme hatası', { 
        error: (error as Error).message, 
        filters 
      });
      return [];
    }
  }

  // Slippage ile restoran bul
  async findBySlippage(minSlippage: number, maxSlippage: number): Promise<Restaurant[]> {
    try {
      const allRestaurants = await this.findAll({ page: 1, limit: 1000, skip: 0 });
      return allRestaurants.data.filter(restaurant => 
        restaurant.defaultSlippageBps >= minSlippage && 
        restaurant.defaultSlippageBps <= maxSlippage
      );
    } catch (error) {
      logger.error('Slippage ile restoran bulma hatası', { 
        error: (error as Error).message, 
        minSlippage, 
        maxSlippage 
      });
      return [];
    }
  }
}
