import { Router } from 'express';
import { OracleService } from '../services/OracleService.js';
import { authenticateApiKey, rateLimiter } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { ValidationUtils } from '../utils/validation.js';
import { ResponseUtils } from '../utils/response.js';
import { OraclePriceUpdate, OracleTokenUpdate, OracleBatchUpdate } from '../types/index.js';

const router = Router();
const oracleService = new OracleService();

// Oracle servisini başlat
oracleService.initialize().catch(logger.error);

// Tüm route'larda rate limiting uygula
router.use(rateLimiter);

// Fiyat güncelleme (API key gerekli)
router.post('/update-eth-price', authenticateApiKey, async (req, res) => {
  try {
    const { priceUSD } = req.body;
    
    // Validation
    const validation = ValidationUtils.validateOraclePriceUpdate({ priceUSD });
    if (!validation.isValid) {
      return ResponseUtils.validationError(res, validation.errors);
    }

    const txHash = await oracleService.updateEthPrice(priceUSD);
    
    logger.info('ETH fiyatı güncellendi', { priceUSD, txHash, ip: req.ip });
    
    ResponseUtils.success(res, {
      priceUSD,
      transactionHash: txHash
    }, 'ETH fiyatı başarıyla güncellendi');
  } catch (error) {
    logger.error('ETH fiyat güncelleme hatası:', error);
    ResponseUtils.error(res, 'Fiyat güncellenirken hata oluştu', error.message);
  }
});

router.post('/update-token-price', authenticateApiKey, async (req, res) => {
  try {
    const { tokenAddress, priceUSD } = req.body;
    
    // Validation
    const validation = ValidationUtils.validateOracleTokenUpdate({ tokenAddress, priceUSD });
    if (!validation.isValid) {
      return ResponseUtils.validationError(res, validation.errors);
    }

    const txHash = await oracleService.updateTokenPrice(tokenAddress, priceUSD);
    
    logger.info('Token fiyatı güncellendi', { tokenAddress, priceUSD, txHash, ip: req.ip });
    
    ResponseUtils.success(res, {
      tokenAddress,
      priceUSD,
      transactionHash: txHash
    }, 'Token fiyatı başarıyla güncellendi');
  } catch (error) {
    logger.error('Token fiyat güncelleme hatası:', error);
    ResponseUtils.error(res, 'Fiyat güncellenirken hata oluştu', error.message);
  }
});

// Fiyat sorgulama (API key gerekli değil)
router.get('/eth-price', async (req, res) => {
  try {
    const price = await oracleService.getCurrentEthPrice();
    
    ResponseUtils.success(res, {
      priceUSD: price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('ETH fiyat sorgulama hatası:', error);
    ResponseUtils.error(res, 'Fiyat sorgulanırken hata oluştu', error.message);
  }
});

router.get('/token-price/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!ValidationUtils.isValidAddress(tokenAddress)) {
      return ResponseUtils.badRequest(res, 'Geçersiz token adresi');
    }
    
    const price = await oracleService.getCurrentTokenPrice(tokenAddress);
    
    ResponseUtils.success(res, {
      tokenAddress,
      priceUSD: price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Token fiyat sorgulama hatası:', error);
    ResponseUtils.error(res, 'Fiyat sorgulanırken hata oluştu', error.message);
  }
});

// Batch fiyat güncelleme (API key gerekli)
router.post('/batch-update-prices', authenticateApiKey, async (req, res) => {
  try {
    const { updates } = req.body;
    
    // Validation
    const validation = ValidationUtils.validateBatchUpdate(updates);
    if (!validation.isValid) {
      return ResponseUtils.validationError(res, validation.errors);
    }

    const results = [];
    
    for (const update of updates) {
      try {
        if (update.type === 'eth') {
          const txHash = await oracleService.updateEthPrice(update.priceUSD);
          results.push({
            type: 'eth',
            success: true,
            priceUSD: update.priceUSD,
            transactionHash: txHash
          });
        } else if (update.type === 'token') {
          const txHash = await oracleService.updateTokenPrice(update.tokenAddress, update.priceUSD);
          results.push({
            type: 'token',
            success: true,
            tokenAddress: update.tokenAddress,
            priceUSD: update.priceUSD,
            transactionHash: txHash
          });
        }
      } catch (error) {
        results.push({
          type: update.type,
          success: false,
          error: error.message
        });
      }
    }
    
    logger.info('Batch fiyat güncellemesi tamamlandı', { 
      totalUpdates: updates.length, 
      successfulUpdates: results.filter(r => r.success).length,
      ip: req.ip 
    });
    
    ResponseUtils.success(res, {
      totalUpdates: updates.length,
      successfulUpdates: results.filter(r => r.success).length,
      results
    }, 'Batch fiyat güncellemesi tamamlandı');
  } catch (error) {
    logger.error('Batch fiyat güncelleme hatası:', error);
    ResponseUtils.error(res, 'Batch fiyat güncellemesi sırasında hata oluştu', error.message);
  }
});

export default router;
