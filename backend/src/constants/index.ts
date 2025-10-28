// Server Constants
export const SERVER_CONFIG = {
  DEFAULT_PORT: 4000,
  DEFAULT_HOST: 'localhost',
  API_PREFIX: '/api',
  HEALTH_ENDPOINT: '/health',
  VERSION: '1.0.0'
} as const;

// Database Constants
export const DB_CONFIG = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 1000
} as const;

// Oracle Constants
export const ORACLE_CONFIG = {
  PRICE_DECIMALS: 18,
  MIN_PRICE: 0.000001,
  MAX_PRICE: 1000000,
  BATCH_SIZE: 10
} as const;

// Rate Limiting Constants
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 100,
  MESSAGE: 'Çok fazla istek gönderildi. Lütfen bekleyin.',
  SKIP_SUCCESS_REQUESTS: false
} as const;

// Cron Job Constants
export const CRON_CONFIG = {
  SUBGRAPH_SYNC: '*/5 * * * *', // Every 5 minutes
  ORACLE_UPDATE: '0 * * * *',   // Every hour
  DAILY_CLEANUP: '0 0 * * *',   // Daily at midnight
  PRICE_FETCH: '*/15 * * * *'   // Every 15 minutes
} as const;

// HTTP Status Messages
export const HTTP_MESSAGES = {
  SUCCESS: 'İşlem başarıyla tamamlandı',
  CREATED: 'Kayıt başarıyla oluşturuldu',
  UPDATED: 'Kayıt başarıyla güncellendi',
  DELETED: 'Kayıt başarıyla silindi',
  NOT_FOUND: 'Kayıt bulunamadı',
  BAD_REQUEST: 'Geçersiz istek',
  UNAUTHORIZED: 'Yetkilendirme gerekli',
  FORBIDDEN: 'Erişim reddedildi',
  INTERNAL_ERROR: 'Sunucu hatası',
  VALIDATION_ERROR: 'Girilen veriler geçersiz',
  RATE_LIMIT_EXCEEDED: 'Rate limit aşıldı'
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Bu alan zorunludur',
  INVALID_EMAIL: 'Geçersiz email adresi',
  INVALID_ADDRESS: 'Geçersiz Ethereum adresi',
  INVALID_PRICE: 'Geçersiz fiyat değeri',
  PRICE_TOO_LOW: 'Fiyat çok düşük',
  PRICE_TOO_HIGH: 'Fiyat çok yüksek',
  INVALID_PAGE: 'Geçersiz sayfa numarası',
  INVALID_LIMIT: 'Geçersiz limit değeri',
  INVALID_TOKEN_ADDRESS: 'Geçersiz token adresi',
  INVALID_AMOUNT: 'Geçersiz miktar'
} as const;

// Log Messages
export const LOG_MESSAGES = {
  SERVER_STARTED: '🚀 Backend server başlatıldı',
  DATABASE_CONNECTED: '✅ Veritabanı başarıyla bağlandı',
  DATABASE_ERROR: '❌ Veritabanı bağlantı hatası',
  SYNC_STARTED: '🔄 Veri senkronizasyonu başlatıldı',
  SYNC_COMPLETED: '✅ Veri senkronizasyonu tamamlandı',
  SYNC_ERROR: '❌ Veri senkronizasyon hatası',
  ORACLE_UPDATE_STARTED: '🔄 Oracle fiyat güncellemesi başlatıldı',
  ORACLE_UPDATE_COMPLETED: '✅ Oracle fiyat güncellemesi tamamlandı',
  ORACLE_UPDATE_ERROR: '❌ Oracle fiyat güncellemesi hatası',
  AUTH_SUCCESS: '🔐 Kimlik doğrulama başarılı',
  AUTH_FAILED: '❌ Kimlik doğrulama başarısız'
} as const;

// Security Constants
export const SECURITY_CONFIG = {
  API_KEY_LENGTH: 32
} as const;

// External API Constants
export const EXTERNAL_API_CONFIG = {
  COINGECKO_TIMEOUT: 10000,
  BINANCE_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;
