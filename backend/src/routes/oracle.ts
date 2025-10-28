import { Router, Request, Response } from 'express';
import { OracleService } from '../services/OracleService.js';
import { authenticateApiKey, rateLimitMiddleware } from '../middleware/auth.js';
import { validationSchemas } from '../utils/validation.js';
import { ResponseUtils } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = Router();
const oracleService = new OracleService();

// Rate limiting ve API key authentication
router.use(rateLimitMiddleware);

// ETH fiyatını güncelle
router.post('/update-eth-price', 
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const { priceUSD, source } = req.body;
      
      logger.info('ETH fiyat güncelleme isteği', { priceUSD, source, ip: req.ip });
      
      const success = await oracleService.updateEthPrice(priceUSD, source);
      
      if (success) {
        ResponseUtils.success(res, { priceUSD, source }, 'ETH fiyatı başarıyla güncellendi');
      } else {
        ResponseUtils.error(res, 'Update Failed', 'ETH fiyatı güncellenemedi');
      }
    } catch (error) {
      logger.error('ETH fiyat güncelleme hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
    }
  }
);

// Token fiyatını güncelle
router.post('/update-token-price',
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const { priceUSD, tokenAddress, source } = req.body;
      
      if (!tokenAddress) {
        return ResponseUtils.badRequest(res, 'Token adresi gerekli');
      }
      
      logger.info('Token fiyat güncelleme isteği', { tokenAddress, priceUSD, source, ip: req.ip });
      
      const success = await oracleService.updateTokenPrice(tokenAddress, priceUSD, source);
      
      if (success) {
        ResponseUtils.success(res, { tokenAddress, priceUSD, source }, 'Token fiyatı başarıyla güncellendi');
      } else {
        ResponseUtils.error(res, 'Update Failed', 'Token fiyatı güncellenemedi');
      }
    } catch (error) {
      logger.error('Token fiyat güncelleme hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
    }
  }
);

// Toplu fiyat güncellemesi
router.post('/batch-update-prices',
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const { updates } = req.body;
      
      logger.info('Toplu fiyat güncelleme isteği', { 
        count: updates.length, 
        ip: req.ip 
      });
      
      const results = await oracleService.batchUpdatePrices(updates);
      const successCount = results.filter(r => r).length;
      
      ResponseUtils.success(res, { 
        total: updates.length, 
        success: successCount, 
        failed: updates.length - successCount 
      }, 'Toplu fiyat güncellemesi tamamlandı');
    } catch (error) {
      logger.error('Toplu fiyat güncelleme hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
    }
  }
);

// Mevcut ETH fiyatını al
router.get('/eth-price', async (req: Request, res: Response) => {
  try {
    logger.info('ETH fiyat sorgusu', { ip: req.ip });
    
    const price = await oracleService.getCurrentEthPrice();
    ResponseUtils.success(res, price, 'ETH fiyatı başarıyla alındı');
  } catch (error) {
    logger.error('ETH fiyat sorgu hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
  }
});

// Mevcut token fiyatını al
router.get('/token-price/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    
    logger.info('Token fiyat sorgusu', { tokenAddress, ip: req.ip });
    
    const price = await oracleService.getCurrentTokenPrice(tokenAddress);
    ResponseUtils.success(res, price, 'Token fiyatı başarıyla alındı');
  } catch (error) {
    logger.error('Token fiyat sorgu hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
  }
});

// Gas estimate
router.post('/estimate-gas', 
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const { priceUSD, operation } = req.body;
      
      if (!priceUSD || !operation) {
        return ResponseUtils.badRequest(res, 'Fiyat ve operasyon türü gerekli');
      }
      
      logger.info('Gas estimate isteği', { priceUSD, operation, ip: req.ip });
      
      let gasEstimate: string;
      
      if (operation === 'updateEthPrice') {
        gasEstimate = await oracleService.estimateGasForEthPriceUpdate(priceUSD);
      } else {
        return ResponseUtils.badRequest(res, 'Desteklenmeyen operasyon türü');
      }
      
      ResponseUtils.success(res, { 
        operation, 
        priceUSD, 
        gasEstimate,
        gasEstimateGwei: (parseInt(gasEstimate) * 20) / 1e9 // 20 gwei gas price varsayımı
      }, 'Gas estimate başarıyla hesaplandı');
    } catch (error) {
      logger.error('Gas estimate hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'Oracle Error', (error as Error).message);
    }
  }
);

// Oracle health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    logger.info('Oracle health check isteği', { ip: req.ip });
    
    const isHealthy = await oracleService.checkOracleHealth();
    
    if (isHealthy) {
      ResponseUtils.success(res, { status: 'healthy' }, 'Oracle sağlıklı');
    } else {
      ResponseUtils.error(res, 'Unhealthy', 'Oracle sağlıksız', 503);
    }
  } catch (error) {
    logger.error('Oracle health check hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Health Check Error', (error as Error).message, 503);
  }
});

// Harici kaynaklardan fiyat güncelleme (manuel tetikleme)
router.post('/update-from-external',
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      logger.info('Harici kaynaklardan fiyat güncelleme isteği', { ip: req.ip });
      
      await oracleService.updatePricesFromExternalSource();
      
      ResponseUtils.success(res, null, 'Harici kaynaklardan fiyat güncellemesi başlatıldı');
    } catch (error) {
      logger.error('Harici fiyat güncelleme hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'External Update Error', (error as Error).message);
    }
  }
);

// Fiyat güncelleme geçmişi
router.get('/price-history', 
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const { tokenAddress, limit = 50, page = 1 } = req.query;
      
      logger.info('Fiyat geçmişi sorgusu', { tokenAddress, limit, page, ip: req.ip });
      
      // Bu endpoint PriceUpdate entity'sinden veri çekecek
      // Şimdilik placeholder olarak bırakıyoruz
      ResponseUtils.success(res, { 
        message: 'Fiyat geçmişi endpoint\'i geliştiriliyor',
        tokenAddress,
        limit,
        page
      });
    } catch (error) {
      logger.error('Fiyat geçmişi sorgu hatası', { error: (error as Error).message, ip: req.ip });
      ResponseUtils.error(res, 'History Error', (error as Error).message);
    }
  }
);

export default router;
