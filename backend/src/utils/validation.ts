import Joi from 'joi';
import { ethers } from 'ethers';
import { VALIDATION_MESSAGES, ORACLE_CONFIG } from '../constants/index.js';

export class ValidationUtils {
  // Ethereum address validation
  static isValidEthereumAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }

  // Price validation
  static isValidPrice(price: number): boolean {
    return price >= ORACLE_CONFIG.MIN_PRICE && price <= ORACLE_CONFIG.MAX_PRICE;
  }

  // Pagination validation
  static validatePagination(page: number, limit: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (page < 1) {
      errors.push(VALIDATION_MESSAGES.INVALID_PAGE);
    }

    if (limit < 1 || limit > 100) {
      errors.push(VALIDATION_MESSAGES.INVALID_LIMIT);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


}

// Joi validation schemas
export const validationSchemas = {
  // Oracle price update
  oraclePriceUpdate: Joi.object({
    priceUSD: Joi.number()
      .min(ORACLE_CONFIG.MIN_PRICE)
      .max(ORACLE_CONFIG.MAX_PRICE)
      .required()
      .messages({
        'number.base': 'Fiyat sayı olmalıdır',
        'number.min': `Fiyat en az ${ORACLE_CONFIG.MIN_PRICE} olmalıdır`,
        'number.max': `Fiyat en fazla ${ORACLE_CONFIG.MAX_PRICE} olmalıdır`,
        'any.required': 'Fiyat zorunludur'
      }),
    tokenAddress: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{40}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Geçersiz token adresi'
      }),
    source: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Kaynak en fazla 50 karakter olmalıdır'
      })
  }),

  // Oracle batch update
  oracleBatchUpdate: Joi.object({
    updates: Joi.array()
      .items(Joi.object({
        priceUSD: Joi.number()
          .min(ORACLE_CONFIG.MIN_PRICE)
          .max(ORACLE_CONFIG.MAX_PRICE)
          .required(),
        tokenAddress: Joi.string()
          .pattern(/^0x[a-fA-F0-9]{40}$/)
          .optional(),
        source: Joi.string()
          .max(50)
          .optional()
      }))
      .min(1)
      .max(ORACLE_CONFIG.BATCH_SIZE)
      .required()
      .messages({
        'array.min': 'En az bir güncelleme gerekli',
        'array.max': `En fazla ${ORACLE_CONFIG.BATCH_SIZE} güncelleme yapılabilir`
      })
  }),



  // Pagination
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Sayfa numarası sayı olmalıdır',
        'number.integer': 'Sayfa numarası tam sayı olmalıdır',
        'number.min': 'Sayfa numarası en az 1 olmalıdır'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': 'Limit sayı olmalıdır',
        'number.integer': 'Limit tam sayı olmalıdır',
        'number.min': 'Limit en az 1 olmalıdır',
        'number.max': 'Limit en fazla 100 olmalıdır'
      }),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'name', 'price', 'rating')
      .optional()
      .messages({
        'any.only': 'Geçersiz sıralama alanı'
      }),
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
      .messages({
        'any.only': 'Geçersiz sıralama yönü'
      })
  })
};
