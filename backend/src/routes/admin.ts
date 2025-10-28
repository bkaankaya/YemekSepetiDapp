import express from 'express';
import { logger } from '../utils/logger.js';
import { ResponseUtils } from '../utils/response.js';
import { CustomerRepository, RestaurantRepository, MenuItemRepository, OrderRepository } from '../data/repositories/index.js';
import { requireOwner } from '../middleware/roleAuth.js';

const router = express.Router();

// Tüm admin routes'ları sadece owner erişebilir
router.use(requireOwner);

// Database overview
router.get('/overview', async (req, res) => {
  try {
    const [customers, restaurants, menuItems, orders] = await Promise.all([
      new CustomerRepository().count(),
      new RestaurantRepository().count(),
      new MenuItemRepository().count(),
      new OrderRepository().count()
    ]);

    ResponseUtils.success(res, {
      database: {
        customers,
        restaurants,
        menuItems,
        orders,
        total: customers + restaurants + menuItems + orders
      },
      timestamp: new Date().toISOString()
    }, 'Database overview başarıyla getirildi');
  } catch (error) {
    logger.error('Database overview hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Database overview alınamadı');
  }
});

// Database health check
router.get('/health', async (req, res) => {
  try {
    const [customerRepo, restaurantRepo, menuItemRepo, orderRepo] = [
      new CustomerRepository(),
      new RestaurantRepository(),
      new MenuItemRepository(),
      new OrderRepository()
    ];

    const health = {
      customers: {
        count: await customerRepo.count(),
        status: 'OK'
      },
      restaurants: {
        count: await restaurantRepo.count(),
        status: 'OK'
      },
      menuItems: {
        count: await menuItemRepo.count(),
        status: 'OK'
      },
      orders: {
        count: await orderRepo.count(),
        status: 'OK'
      },
      timestamp: new Date().toISOString()
    };

    ResponseUtils.success(res, health, 'Database health check başarılı');
  } catch (error) {
    logger.error('Database health check hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Database health check başarısız');
  }
});

// Database temizleme
router.delete('/clear-all', async (req, res) => {
  try {
    const [customerRepo, restaurantRepo, menuItemRepo, orderRepo] = [
      new CustomerRepository(),
      new RestaurantRepository(),
      new MenuItemRepository(),
      new OrderRepository()
    ];

    await Promise.all([
      customerRepo.clearAll(),
      restaurantRepo.clearAll(),
      menuItemRepo.clearAll(),
      orderRepo.clearAll()
    ]);

    ResponseUtils.success(res, null, 'Tüm veriler temizlendi');
  } catch (error) {
    logger.error('Database temizleme hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Database temizlenemedi');
  }
});

// Belirli bir entity'yi sil
router.delete('/:entity/:id', async (req, res) => {
  try {
    const { entity, id } = req.params;
    
    let result = false;
    
    switch (entity) {
      case 'customers':
        result = await new CustomerRepository().delete(id);
        break;
      case 'restaurants':
        result = await new RestaurantRepository().delete(id);
        break;
      case 'menu-items':
        result = await new MenuItemRepository().delete(id);
        break;
      case 'orders':
        result = await new OrderRepository().delete(id);
        break;
      default:
        return ResponseUtils.badRequest(res, 'Geçersiz entity türü');
    }

    if (result) {
      ResponseUtils.success(res, null, `${entity} başarıyla silindi`);
    } else {
      ResponseUtils.notFound(res, `${entity} bulunamadı`);
    }
  } catch (error) {
    logger.error('Entity silme hatası', { error: (error as Error).message, entity: req.params.entity, id: req.params.id });
    ResponseUtils.error(res, 'Entity silinemedi');
  }
});

// Database backup (basit JSON export)
router.get('/backup', async (req, res) => {
  try {
    const [customerRepo, restaurantRepo, menuItemRepo, orderRepo] = [
      new CustomerRepository(),
      new RestaurantRepository(),
      new MenuItemRepository(),
      new OrderRepository()
    ];

    const backup = {
      customers: await customerRepo.findAll({ page: 1, limit: 10000, skip: 0 }),
      restaurants: await restaurantRepo.findAll({ page: 1, limit: 10000, skip: 0 }),
      menuItems: await menuItemRepo.findAll({ page: 1, limit: 10000, skip: 0 }),
      orders: await orderRepo.findAll({ page: 1, limit: 10000, skip: 0 }),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    ResponseUtils.success(res, backup, 'Database backup başarıyla oluşturuldu');
  } catch (error) {
    logger.error('Database backup hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Database backup oluşturulamadı');
  }
});

export default router;
