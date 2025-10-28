import { Router } from 'express';
import { SubgraphService } from '../services/SubgraphService.js';
import { authenticateApiKey, rateLimiter } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { AppDataSource } from '../config/database.js';
import { Order, Customer, Restaurant, MenuItem, PriceUpdate } from '../entities/index.js';

const router = Router();
const subgraphService = new SubgraphService();

// Tüm route'larda rate limiting uygula
router.use(rateLimiter);

// Manuel veri senkronizasyonu (API key gerekli)
router.post('/sync', authenticateApiKey, async (req, res) => {
  try {
    logger.info('Manuel veri senkronizasyonu başlatıldı', { ip: req.ip });
    
    await subgraphService.syncAllData();
    
    res.json({
      success: true,
      message: 'Veri senkronizasyonu başarıyla tamamlandı',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Veri senkronizasyon hatası:', error);
    res.status(500).json({
      error: 'Veri senkronizasyonu sırasında hata oluştu',
      message: error.message
    });
  }
});

// Veri istatistikleri (API key gerekli değil)
router.get('/stats', async (req, res) => {
  try {
    const [
      customerCount,
      restaurantCount,
      menuItemCount,
      orderCount,
      priceUpdateCount
    ] = await Promise.all([
      AppDataSource.getRepository(Customer).count(),
      AppDataSource.getRepository(Restaurant).count(),
      AppDataSource.getRepository(MenuItem).count(),
      AppDataSource.getRepository(Order).count(),
      AppDataSource.getRepository(PriceUpdate).count()
    ]);

    res.json({
      success: true,
      data: {
        customers: customerCount,
        restaurants: restaurantCount,
        menuItems: menuItemCount,
        orders: orderCount,
        priceUpdates: priceUpdateCount,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('İstatistik sorgulama hatası:', error);
    res.status(500).json({
      error: 'İstatistikler alınırken hata oluştu',
      message: error.message
    });
  }
});

// Müşteri listesi (API key gerekli değil)
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [customers, total] = await AppDataSource.getRepository(Customer).findAndCount({
      skip,
      take: parseInt(limit as string),
      order: { walletAddress: 'ASC' }
    });

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    logger.error('Müşteri listesi sorgulama hatası:', error);
    res.status(500).json({
      error: 'Müşteri listesi alınırken hata oluştu',
      message: error.message
    });
  }
});

// Restoran listesi (API key gerekli değil)
router.get('/restaurants', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [restaurants, total] = await AppDataSource.getRepository(Restaurant).findAndCount({
      skip,
      take: parseInt(limit as string),
      order: { walletAddress: 'ASC' }
    });

    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    logger.error('Restoran listesi sorgulama hatası:', error);
    res.status(500).json({
      error: 'Restoran listesi alınırken hata oluştu',
      message: error.message
    });
  }
});

// Sipariş listesi (API key gerekli değil)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer, restaurant } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (status) where.status = status;
    if (customer) where.customer = { walletAddress: customer };
    if (restaurant) where.restaurant = { walletAddress: restaurant };
    
    const [orders, total] = await AppDataSource.getRepository(Order).findAndCount({
      where,
      relations: ['customer', 'restaurant'],
      skip,
      take: parseInt(limit as string),
      order: { createdAt: 'DESC' }
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    logger.error('Sipariş listesi sorgulama hatası:', error);
    res.status(500).json({
      error: 'Sipariş listesi alınırken hata oluştu',
      message: error.message
    });
  }
});

// Fiyat güncelleme geçmişi (API key gerekli değil)
router.get('/price-updates', async (req, res) => {
  try {
    const { page = 1, limit = 20, itemName } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (itemName) where.itemName = itemName;
    
    const [priceUpdates, total] = await AppDataSource.getRepository(PriceUpdate).findAndCount({
      where,
      skip,
      take: parseInt(limit as string),
      order: { timestamp: 'DESC' }
    });

    res.json({
      success: true,
      data: {
        priceUpdates,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    logger.error('Fiyat güncelleme geçmişi sorgulama hatası:', error);
    res.status(500).json({
      error: 'Fiyat güncelleme geçmişi alınırken hata oluştu',
      message: error.message
    });
  }
});

export default router;
