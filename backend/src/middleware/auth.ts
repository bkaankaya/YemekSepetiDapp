import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ResponseUtils } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Rate limiter configuration
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Rate limit aşıldı. Lütfen daha sonra tekrar deneyin.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            handler: (req: Request, res: Response) => {
            logger.warn('Rate limit aşıldı', { ip: req.ip, path: req.path });
            ResponseUtils.rateLimitExceeded(res, 900); // 15 dakika
          }
});

// API key authentication
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      logger.warn('API key eksik', { ip: req.ip, path: req.path });
      ResponseUtils.unauthorized(res, 'API key gerekli');
      return;
    }
    
    // API key validation logic here
    // For now, we'll accept any non-empty API key
    if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
      logger.debug('API key doğrulandı', { ip: req.ip, path: req.path });
      next();
    } else {
      logger.warn('Geçersiz API key', { ip: req.ip, path: req.path });
      ResponseUtils.unauthorized(res, 'Geçersiz API key');
      return;
    }
  } catch (error) {
    logger.error('API key authentication hatası', { error: (error as Error).message, ip: req.ip });
    ResponseUtils.error(res, 'Authentication Error', 'API key doğrulama hatası');
    return;
  }
};

// Rate limiting middleware
export const rateLimitMiddleware = rateLimiter;

// CORS middleware
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = process.env.CORS_ORIGIN || '*';
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

// Error handling middleware
export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  if (!res.headersSent) {
    ResponseUtils.error(res, 'Internal Server Error', 'Beklenmeyen bir hata oluştu');
  }
};

// Not found middleware
export const notFoundMiddleware = (req: Request, res: Response): void => {
  logger.warn('Route not found', { method: req.method, path: req.path, ip: req.ip });
  ResponseUtils.notFound(res, 'Route bulunamadı');
};
