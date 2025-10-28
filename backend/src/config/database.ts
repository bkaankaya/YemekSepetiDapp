import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger.js';

export class RedisDatabase {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis bağlantısı başlatılıyor...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis bağlantısı hazır');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis bağlantı hatası:', error);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis bağlantısı kapatıldı');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis yeniden bağlanıyor...');
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        logger.info('Redis veritabanına başarıyla bağlanıldı');
      }
    } catch (error) {
      logger.error('Redis bağlantı hatası:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis bağlantısı kapatıldı');
      }
    } catch (error) {
      logger.error('Redis bağlantı kapatma hatası:', error);
      throw error;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  // Key prefix helper
  getKeyPrefix(): string {
    return process.env.REDIS_KEY_PREFIX || 'yemeksepeti:';
  }

  // Helper method to create full key with prefix
  createKey(key: string): string {
    return `${this.getKeyPrefix()}${key}`;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      // Ping Redis to check if it's responsive
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check hatası:', error);
      return false;
    }
  }
}

// Singleton instance
export const redisDatabase = new RedisDatabase();

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await redisDatabase.connect();
    logger.info('Veritabanı başlatıldı');
  } catch (error) {
    logger.error('Veritabanı başlatma hatası:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  try {
    await redisDatabase.disconnect();
    logger.info('Veritabanı bağlantısı kapatıldı');
  } catch (error) {
    logger.error('Veritabanı kapatma hatası:', error);
    throw error;
  }
}
