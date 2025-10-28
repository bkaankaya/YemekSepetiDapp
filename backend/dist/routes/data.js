import { Router } from 'express';
import { SubgraphService } from '../services/SubgraphService.js';
import { SyncJob } from '../jobs/syncJob.js';
import { CustomerRepository, RestaurantRepository, MenuItemRepository, OrderRepository, PriceUpdateRepository } from '../data/repositories/index.js';
import { rateLimitMiddleware } from '../middleware/auth.js';
import { ResponseUtils } from '../utils/response.js';
import { logger } from '../utils/logger.js';
const router = Router();
const subgraphService = new SubgraphService();
const syncJob = new SyncJob();
// Repository instances
const customerRepository = new CustomerRepository();
const restaurantRepository = new RestaurantRepository();
const menuItemRepository = new MenuItemRepository();
const orderRepository = new OrderRepository();
const priceUpdateRepository = new PriceUpdateRepository();
// Rate limiting
router.use(rateLimitMiddleware);
// Manuel veri senkronizasyonu
router.post('/sync', async (req, res) => {
    try {
        const { type } = req.body; // 'all', 'customers', 'restaurants', 'menuItems', 'orders'
        logger.info('Manuel veri senkronizasyonu isteği', { type, ip: req.ip });
        if (type === 'all' || !type) {
            await subgraphService.syncAllData();
            ResponseUtils.success(res, null, 'Tüm veriler başarıyla senkronize edildi');
        }
        else if (type === 'customers') {
            await subgraphService.syncCustomers();
            ResponseUtils.success(res, null, 'Müşteriler başarıyla senkronize edildi');
        }
        else if (type === 'restaurants') {
            await subgraphService.syncRestaurants();
            ResponseUtils.success(res, null, 'Restoranlar başarıyla senkronize edildi');
        }
        else if (type === 'menuItems') {
            await subgraphService.syncMenuItems();
            ResponseUtils.success(res, null, 'Menü öğeleri başarıyla senkronize edildi');
        }
        else if (type === 'orders') {
            await subgraphService.syncOrders();
            ResponseUtils.success(res, null, 'Siparişler başarıyla senkronize edildi');
        }
        else {
            return ResponseUtils.badRequest(res, 'Geçersiz senkronizasyon türü');
        }
    }
    catch (error) {
        logger.error('Manuel veri senkronizasyonu hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Sync Error', error.message);
    }
});
// Veri istatistikleri
router.get('/stats', async (req, res) => {
    try {
        logger.info('Veri istatistikleri sorgusu', { ip: req.ip });
        const stats = await subgraphService.getSyncStats();
        const healthCheck = await syncJob.healthCheck();
        ResponseUtils.success(res, {
            ...stats,
            system: {
                subgraph: healthCheck.subgraph,
                oracle: healthCheck.oracle,
                jobs: healthCheck.jobs,
                status: healthCheck.status
            }
        }, 'Veri istatistikleri başarıyla alındı');
    }
    catch (error) {
        logger.error('Veri istatistikleri hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Stats Error', error.message);
    }
});
// Müşteri listesi
router.get('/customers', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        logger.info('Müşteri listesi sorgusu', { page: pageNum, limit: limitNum, search, ip: req.ip });
        const params = { page: pageNum, limit: limitNum, skip };
        let result;
        if (search) {
            result = await customerRepository.search(search, params);
        }
        else {
            result = await customerRepository.findAll(params);
        }
        ResponseUtils.paginatedSuccess(res, result.data, result.pagination, 'Müşteri listesi başarıyla alındı');
    }
    catch (error) {
        logger.error('Müşteri listesi hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Customers Error', error.message);
    }
});
// Restoran listesi
router.get('/restaurants', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, cuisine, isActive, acceptsTokens } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        logger.info('Restoran listesi sorgusu', { page: pageNum, limit: limitNum, search, cuisine, isActive, acceptsTokens, ip: req.ip });
        const params = { page: pageNum, limit: limitNum, skip };
        const filters = {
            search: search,
            cuisine: cuisine,
            isActive: isActive === 'true',
            acceptsTokens: acceptsTokens === 'true'
        };
        const result = await restaurantRepository.findWithFilters(filters, params);
        ResponseUtils.paginatedSuccess(res, result.data, result.pagination, 'Restoran listesi başarıyla alındı');
    }
    catch (error) {
        logger.error('Restoran listesi hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Restaurants Error', error.message);
    }
});
// Sipariş listesi
router.get('/orders', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, paymentMethod, customerId, restaurantId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        logger.info('Sipariş listesi sorgusu', { page: pageNum, limit: limitNum, status, paymentMethod, customerId, restaurantId, ip: req.ip });
        const params = { page: pageNum, limit: limitNum, skip };
        const filters = {
            status: status,
            paymentMethod: paymentMethod,
            customerId: customerId,
            restaurantId: restaurantId
        };
        const result = await orderRepository.findWithFilters(filters, params);
        ResponseUtils.paginatedSuccess(res, result.data, result.pagination, 'Sipariş listesi başarıyla alındı');
    }
    catch (error) {
        logger.error('Sipariş listesi hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Orders Error', error.message);
    }
});
// Fiyat güncelleme geçmişi
router.get('/price-updates', async (req, res) => {
    try {
        const { page = 1, limit = 20, tokenAddress, source } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        logger.info('Fiyat güncelleme geçmişi sorgusu', { page: pageNum, limit: limitNum, tokenAddress, source, ip: req.ip });
        const params = { page: pageNum, limit: limitNum, skip };
        const filters = {
            tokenAddress: tokenAddress,
            source: source
        };
        const result = await priceUpdateRepository.findWithFilters(filters, params);
        ResponseUtils.paginatedSuccess(res, result.data, result.pagination, 'Fiyat güncelleme geçmişi başarıyla alındı');
    }
    catch (error) {
        logger.error('Fiyat güncelleme geçmişi hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Price Updates Error', error.message);
    }
});
// Cron job durumları
router.get('/jobs', async (req, res) => {
    try {
        logger.info('Cron job durumları sorgusu', { ip: req.ip });
        const jobStatuses = syncJob.getJobStatuses();
        ResponseUtils.success(res, jobStatuses, 'Cron job durumları başarıyla alındı');
    }
    catch (error) {
        logger.error('Cron job durumları hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Jobs Error', error.message);
    }
});
// Manuel Oracle fiyat güncellemesi
router.post('/oracle-update', async (req, res) => {
    try {
        logger.info('Manuel Oracle fiyat güncellemesi isteği', { ip: req.ip });
        await syncJob.manualOracleUpdate();
        ResponseUtils.success(res, null, 'Oracle fiyat güncellemesi başarıyla tamamlandı');
    }
    catch (error) {
        logger.error('Manuel Oracle fiyat güncellemesi hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'Oracle Update Error', error.message);
    }
});
// Sistem durumu
router.get('/system-health', async (req, res) => {
    try {
        logger.info('Sistem durumu sorgusu', { ip: req.ip });
        const healthCheck = await syncJob.healthCheck();
        ResponseUtils.success(res, healthCheck, 'Sistem durumu başarıyla alındı');
    }
    catch (error) {
        logger.error('Sistem durumu hatası', { error: error.message, ip: req.ip });
        ResponseUtils.error(res, 'System Health Error', error.message);
    }
});
export default router;
//# sourceMappingURL=data.js.map