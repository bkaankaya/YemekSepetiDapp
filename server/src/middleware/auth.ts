import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;

  if (!apiKey) {
    logger.warn('API key eksik', { ip: req.ip, path: req.path });
    return res.status(401).json({ 
      error: 'API key gerekli',
      message: 'x-api-key header\'ı veya apiKey query parametresi gerekli'
    });
  }

  const validApiKey = process.env.ORACLE_API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    logger.warn('Geçersiz API key', { ip: req.ip, path: req.path, providedKey: apiKey.substring(0, 8) + '...' });
    return res.status(403).json({ 
      error: 'Geçersiz API key',
      message: 'Sağlanan API key geçersiz'
    });
  }

  req.apiKey = apiKey;
  logger.info('API key doğrulandı', { ip: req.ip, path: req.path });
  next();
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Basit rate limiting - production'da daha gelişmiş bir çözüm kullanın
  const clientIp = req.ip;
  const now = Date.now();
  
  // Bu basit implementasyon - production'da Redis veya database kullanın
  if (!global.rateLimitMap) {
    global.rateLimitMap = new Map();
  }

  const clientData = global.rateLimitMap.get(clientIp) || { count: 0, resetTime: now + 60000 };
  
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + 60000;
  }

  if (clientData.count >= 100) { // 1 dakikada max 100 istek
    logger.warn('Rate limit aşıldı', { ip: clientIp });
    return res.status(429).json({ 
      error: 'Rate limit aşıldı',
      message: 'Çok fazla istek gönderildi. Lütfen bekleyin.'
    });
  }

  clientData.count++;
  global.rateLimitMap.set(clientIp, clientData);
  next();
};
