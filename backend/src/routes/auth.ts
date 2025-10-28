import { Router, Request, Response } from 'express';
import { UserRepository } from '../data/repositories/UserRepository.js';
import { User, UserRole } from '../data/types.js';
import { rateLimitMiddleware } from '../middleware/auth.js';
import { ResponseUtils } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = Router();
const userRepository = new UserRepository();

// Rate limiting
router.use(rateLimitMiddleware);

// Kullanıcı profili
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // API key ile kullanıcı bilgisi alınabilir
    // Şimdilik basit bir response döndürüyoruz
    logger.info('Kullanıcı profili sorgusu', { ip: req.ip });
    
    ResponseUtils.success(res, { 
      message: 'API key authentication ile kullanıcı profili alınabilir',
      note: 'JWT authentication kaldırıldı'
    }, 'Profil bilgisi');
  } catch (error) {
    logger.error('Kullanıcı profili hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Profile Error', (error as Error).message);
  }
});

// Sistem durumu
router.get('/health', async (req: Request, res: Response) => {
  try {
    logger.info('Auth health check isteği', { ip: req.ip });
    
    ResponseUtils.success(res, { 
      status: 'healthy',
      message: 'Auth servisi çalışıyor',
      note: 'JWT authentication kaldırıldı, sadece API key authentication aktif'
    }, 'Auth servisi sağlıklı');
  } catch (error) {
    logger.error('Auth health check hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Health Check Error', (error as Error).message);
  }
});

export default router;
