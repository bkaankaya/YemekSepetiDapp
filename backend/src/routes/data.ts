import express from 'express';
import { logger } from '../utils/logger.js';
import { ResponseUtils } from '../utils/response.js';
import { CustomerRepository, RestaurantRepository, MenuItemRepository, OrderRepository } from '../data/repositories/index.js';
import { requireRestaurantOrOwner, requireOwner } from '../middleware/roleAuth.js';

const router = express.Router();

// Tüm data routes'ları sadece restoran ve owner erişebilir
router.use(requireRestaurantOrOwner);

// Müşteri listesi - Sadece restoran ve owner
router.get('/customers', async (req, res) => {
  try {
    const customerRepo = new CustomerRepository();
    const { page = 1, limit = 20, search } = req.query;
    
    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string)
    };

    let customers;
    if (search) {
      customers = await customerRepo.search(search as string, params);
    } else {
      customers = await customerRepo.findAll(params);
    }

    ResponseUtils.successWithMetadata(res, customers.data, 'Müşteriler başarıyla getirildi', {
      pagination: {
        page: customers.page,
        limit: customers.limit,
        total: customers.total,
        totalPages: customers.totalPages
      }
    });
  } catch (error) {
    logger.error('Müşteri listesi hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Müşteri listesi alınamadı');
  }
});

// Restoran listesi - Sadece restoran ve owner
router.get('/restaurants', async (req, res) => {
  try {
    const restaurantRepo = new RestaurantRepository();
    const { page = 1, limit = 20, search } = req.query;
    
    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string)
    };

    let restaurants;
    if (search) {
      restaurants = await restaurantRepo.search(search as string, params);
    } else {
      restaurants = await restaurantRepo.findAll(params);
    }

    ResponseUtils.successWithMetadata(res, restaurants.data, 'Restoranlar başarıyla getirildi', {
      pagination: {
        page: restaurants.page,
        limit: restaurants.limit,
        total: restaurants.total,
        totalPages: restaurants.totalPages
      }
    });
  } catch (error) {
    logger.error('Restoran listesi hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Restoran listesi alınamadı');
  }
});

// Menü öğeleri - Sadece restoran ve owner
router.get('/menu-items', async (req, res) => {
  try {
    const menuItemRepo = new MenuItemRepository();
    const { page = 1, limit = 20, search, restaurant } = req.query;
    
    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string)
    };

    let menuItems;
    if (search) {
      menuItems = await menuItemRepo.search(search as string, params);
    } else if (restaurant) {
      // Belirli bir restoranın menü öğeleri
      const allItems = await menuItemRepo.findAll({ page: 1, limit: 1000, skip: 0 });
      const filteredItems = allItems.data.filter(item => item.restaurant === restaurant);
      
      menuItems = {
        data: filteredItems.slice(params.skip, params.skip + params.limit),
        pagination: {
          page: params.page,
          limit: params.limit,
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / params.limit),
          hasNext: params.page < Math.ceil(filteredItems.length / params.limit),
          hasPrev: params.page > 1
        }
      };
    } else {
      menuItems = await menuItemRepo.findAll(params);
    }

    ResponseUtils.successWithMetadata(res, menuItems.data, 'Menü öğeleri başarıyla getirildi', {
      pagination: {
        page: menuItems.page,
        limit: menuItems.limit,
        total: menuItems.total,
        totalPages: menuItems.totalPages
      }
    });
  } catch (error) {
    logger.error('Menü öğeleri hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Menü öğeleri alınamadı');
  }
});

// Sipariş listesi - Sadece restoran ve owner
router.get('/orders', async (req, res) => {
  try {
    const orderRepo = new OrderRepository();
    const { page = 1, limit = 20, search, status, customer, restaurant } = req.query;
    
    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string)
    };

    let orders;
    if (search) {
      orders = await orderRepo.search(search as string, params);
    } else {
      orders = await orderRepo.findAll(params);
    }

    // Filtreleme
    let filteredOrders = orders.data;
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (customer) {
      filteredOrders = filteredOrders.filter(order => order.customer === customer);
    }
    
    if (restaurant) {
      filteredOrders = filteredOrders.filter(order => order.restaurant === restaurant);
    }

    // Pagination için slice
    const start = params.skip;
    const end = params.skip + params.limit;
    const paginatedOrders = filteredOrders.slice(start, end);
    
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / params.limit);

    ResponseUtils.successWithMetadata(res, paginatedOrders, 'Siparişler başarıyla getirildi', {
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1
      }
    });
  } catch (error) {
    logger.error('Sipariş listesi hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'Sipariş listesi alınamadı');
  }
});

// İstatistikler - Sadece restoran ve owner
router.get('/stats', async (req, res) => {
  try {
    const [customers, restaurants, menuItems, orders] = await Promise.all([
      new CustomerRepository().count(),
      new RestaurantRepository().count(),
      new MenuItemRepository().count(),
      new OrderRepository().count()
    ]);

    ResponseUtils.success(res, {
      customers,
      restaurants,
      menuItems,
      orders
    }, 'İstatistikler başarıyla getirildi');
  } catch (error) {
    logger.error('İstatistik hatası', { error: (error as Error).message });
    ResponseUtils.error(res, 'İstatistikler alınamadı');
  }
});

// Belirli bir müşteri - Sadece restoran ve owner
router.get('/customers/:id', async (req, res) => {
  try {
    const customerRepo = new CustomerRepository();
    const customer = await customerRepo.findById(req.params.id);
    
    if (!customer) {
      return ResponseUtils.notFound(res, 'Müşteri bulunamadı');
    }

    ResponseUtils.success(res, customer, 'Müşteri başarıyla getirildi');
  } catch (error) {
    logger.error('Müşteri getirme hatası', { error: (error as Error).message, id: req.params.id });
    ResponseUtils.error(res, 'Müşteri getirilemedi');
  }
});

// Belirli bir restoran - Sadece restoran ve owner
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurantRepo = new RestaurantRepository();
    const restaurant = await restaurantRepo.findById(req.params.id);
    
    if (!restaurant) {
      return ResponseUtils.notFound(res, 'Restoran bulunamadı');
    }

    ResponseUtils.success(res, restaurant, 'Restoran başarıyla getirildi');
  } catch (error) {
    logger.error('Restoran getirme hatası', { error: (error as Error).message, id: req.params.id });
    ResponseUtils.error(res, 'Restoran getirilemedi');
  }
});

// Belirli bir sipariş - Sadece restoran ve owner
router.get('/orders/:id', async (req, res) => {
  try {
    const orderRepo = new OrderRepository();
    const order = await orderRepo.findById(req.params.id);
    
    if (!order) {
      return ResponseUtils.notFound(res, 'Sipariş bulunamadı');
    }

    ResponseUtils.success(res, order, 'Sipariş başarıyla getirildi');
  } catch (error) {
    logger.error('Sipariş getirme hatası', { error: (error as Error).message, id: req.params.id });
    ResponseUtils.error(res, 'Sipariş getirilemedi');
  }
});

// Database temizleme - Sadece owner
router.delete('/clear-all', requireOwner, async (req, res) => {
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

export default router;
