import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { Customer, PaginationParams, PaginationResult } from '../types.js';
import { BaseRepository } from './BaseRepository.js';

export class CustomerRepository extends BaseRepository<Customer> {
  protected entityKey = 'customers';
  protected entityName = 'customers';

  // Abstract method implementation
  protected matchesSearchPattern(entity: Customer, pattern: string): boolean {
    const searchPattern = pattern.toLowerCase();
    return (
      entity.realWorldAddress.toLowerCase().includes(searchPattern) ||
      entity.walletAddress.toLowerCase().includes(searchPattern)
    );
  }

  // Wallet address ile müşteri bul
  async findByWalletAddress(walletAddress: string): Promise<Customer | null> {
    try {
      const customerId = await redisDatabase.getClient().get(`yemeksepeti:customers:wallet:${walletAddress}`);
      if (!customerId) return null;
      
      return await this.findById(customerId);
    } catch (error) {
      logger.error('Müşteri wallet address ile bulunamadı', { 
        error: (error as Error).message, 
        walletAddress 
      });
      return null;
    }
  }

  // Müşteri kaydet (wallet address index'i de ekle)
  async save(customer: Customer): Promise<Customer> {
    try {
      const savedCustomer = await super.save(customer);
      
      // Wallet address index'i ekle
      await redisDatabase.getClient().set(
        `yemeksepeti:customers:wallet:${customer.walletAddress}`, 
        customer.id
      );
      
      logger.info('Müşteri kaydedildi', { id: customer.id, walletAddress: customer.walletAddress });
      return savedCustomer;
    } catch (error) {
      logger.error('Müşteri kaydetme hatası', { 
        error: (error as Error).message, 
        customer 
      });
      throw error;
    }
  }

  // Müşteri güncelle
  async update(customer: Customer): Promise<Customer> {
    try {
      const updatedCustomer = await super.save(customer);
      logger.info('Müşteri güncellendi', { id: customer.id });
      return updatedCustomer;
    } catch (error) {
      logger.error('Müşteri güncelleme hatası', { 
        error: (error as Error).message, 
        customer 
      });
      throw error;
    }
  }

  // Müşteri sil
  async delete(id: string): Promise<boolean> {
    try {
      const customer = await this.findById(id);
      if (customer) {
        // Wallet address index'ini sil
        await redisDatabase.getClient().del(`yemeksepeti:customers:wallet:${customer.walletAddress}`);
      }
      
      const result = await super.delete(id);
      logger.info('Müşteri silindi', { id });
      return result;
    } catch (error) {
      logger.error('Müşteri silme hatası', { 
        error: (error as Error).message, 
        id 
      });
      throw error;
    }
  }

  // Arama yap (BaseRepository ile uyumlu)
  async search(pattern: string, params: PaginationParams): Promise<PaginationResult<Customer>> {
    try {
      return await super.search(pattern, params);
    } catch (error) {
      logger.error('Müşteri arama hatası', { 
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
  async searchSimple(query: string): Promise<Customer[]> {
    try {
      const allCustomers = await this.findAll({ page: 1, limit: 1000, skip: 0 });
      return allCustomers.data.filter(customer => 
        customer.realWorldAddress.toLowerCase().includes(query.toLowerCase()) ||
        customer.walletAddress.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error('Müşteri basit arama hatası', { 
        error: (error as Error).message, 
        query 
      });
      return [];
    }
  }

  // Filtreleme
  async findWithFilters(filters: any): Promise<Customer[]> {
    try {
      const allCustomers = await this.findAll({ page: 1, limit: 1000, skip: 0 });
      let filtered = allCustomers.data;

      if (filters.search) {
        filtered = filtered.filter(customer => 
          customer.realWorldAddress.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.walletAddress.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      return filtered;
    } catch (error) {
      logger.error('Müşteri filtreleme hatası', { 
        error: (error as Error).message, 
        filters 
      });
      return [];
    }
  }
}
