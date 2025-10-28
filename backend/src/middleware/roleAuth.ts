import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { UserRole } from '../data/types.js';

// Role-based authentication middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // API key'den role bilgisini al
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'API key gerekli'
        });
      }

      // API key'den role'ü çıkar (örnek: yemeksepeti_restaurant_123456)
      const role = extractRoleFromApiKey(apiKey);
      
      if (!role || !allowedRoles.includes(role)) {
        logger.warn('Yetkisiz erişim denemesi', { 
          apiKey: apiKey.substring(0, 10) + '...',
          requiredRoles: allowedRoles,
          userRole: role 
        });
        
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      // Role bilgisini request'e ekle
      req.userRole = role;
      req.userWalletAddress = extractWalletAddressFromApiKey(apiKey);
      
      logger.debug('Role authentication başarılı', { 
        role, 
        walletAddress: req.userWalletAddress?.substring(0, 10) + '...' 
      });
      
      next();
    } catch (error) {
      logger.error('Role authentication hatası', { 
        error: (error as Error).message 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Kimlik doğrulama hatası'
      });
    }
  };
};

// Sadece restoran ve owner erişebilir
export const requireRestaurantOrOwner = requireRole([UserRole.RESTAURANT, UserRole.OWNER]);

// Sadece owner erişebilir
export const requireOwner = requireRole([UserRole.OWNER]);

// Sadece restoran erişebilir
export const requireRestaurant = requireRole([UserRole.RESTAURANT]);

// API key'den role çıkar
function extractRoleFromApiKey(apiKey: string): UserRole | null {
  try {
    // API key formatı: yemeksepeti_[role]_[wallet]_[random]
    const parts = apiKey.split('_');
    
    if (parts.length >= 3 && parts[0] === 'yemeksepeti') {
      const role = parts[1];
      
      switch (role) {
        case 'restaurant':
          return UserRole.RESTAURANT;
        case 'owner':
          return UserRole.OWNER;
        case 'customer':
          return UserRole.CUSTOMER;
        default:
          return null;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('API key role parsing hatası', { error: (error as Error).message });
    return null;
  }
}

// API key'den wallet address çıkar
function extractWalletAddressFromApiKey(apiKey: string): string | null {
  try {
    // API key formatı: yemeksepeti_[role]_[wallet]_[random]
    const parts = apiKey.split('_');
    
    if (parts.length >= 3 && parts[0] === 'yemeksepeti') {
      return parts[2];
    }
    
    return null;
  } catch (error) {
    logger.error('API key wallet address parsing hatası', { error: (error as Error).message });
    return null;
  }
}

// Request interface'ine user bilgilerini ekle
declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
      userWalletAddress?: string;
    }
  }
}
