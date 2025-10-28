export declare const SERVER_CONFIG: {
    readonly DEFAULT_PORT: 4000;
    readonly DEFAULT_HOST: "localhost";
    readonly API_PREFIX: "/api";
    readonly HEALTH_ENDPOINT: "/health";
    readonly VERSION: "1.0.0";
};
export declare const DB_CONFIG: {
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly DEFAULT_PAGE: 1;
    readonly MAX_PAGE_SIZE: 1000;
};
export declare const ORACLE_CONFIG: {
    readonly PRICE_DECIMALS: 18;
    readonly MIN_PRICE: 0.000001;
    readonly MAX_PRICE: 1000000;
    readonly BATCH_SIZE: 10;
};
export declare const RATE_LIMIT_CONFIG: {
    readonly WINDOW_MS: 60000;
    readonly MAX_REQUESTS: 100;
    readonly MESSAGE: "Çok fazla istek gönderildi. Lütfen bekleyin.";
    readonly SKIP_SUCCESS_REQUESTS: false;
};
export declare const CRON_CONFIG: {
    readonly SUBGRAPH_SYNC: "*/5 * * * *";
    readonly ORACLE_UPDATE: "0 * * * *";
    readonly DAILY_CLEANUP: "0 0 * * *";
    readonly PRICE_FETCH: "*/15 * * * *";
};
export declare const HTTP_MESSAGES: {
    readonly SUCCESS: "İşlem başarıyla tamamlandı";
    readonly CREATED: "Kayıt başarıyla oluşturuldu";
    readonly UPDATED: "Kayıt başarıyla güncellendi";
    readonly DELETED: "Kayıt başarıyla silindi";
    readonly NOT_FOUND: "Kayıt bulunamadı";
    readonly BAD_REQUEST: "Geçersiz istek";
    readonly UNAUTHORIZED: "Yetkilendirme gerekli";
    readonly FORBIDDEN: "Erişim reddedildi";
    readonly INTERNAL_ERROR: "Sunucu hatası";
    readonly VALIDATION_ERROR: "Girilen veriler geçersiz";
    readonly RATE_LIMIT_EXCEEDED: "Rate limit aşıldı";
};
export declare const VALIDATION_MESSAGES: {
    readonly REQUIRED_FIELD: "Bu alan zorunludur";
    readonly INVALID_EMAIL: "Geçersiz email adresi";
    readonly INVALID_ADDRESS: "Geçersiz Ethereum adresi";
    readonly INVALID_PRICE: "Geçersiz fiyat değeri";
    readonly PRICE_TOO_LOW: "Fiyat çok düşük";
    readonly PRICE_TOO_HIGH: "Fiyat çok yüksek";
    readonly INVALID_PAGE: "Geçersiz sayfa numarası";
    readonly INVALID_LIMIT: "Geçersiz limit değeri";
    readonly INVALID_TOKEN_ADDRESS: "Geçersiz token adresi";
    readonly INVALID_AMOUNT: "Geçersiz miktar";
};
export declare const LOG_MESSAGES: {
    readonly SERVER_STARTED: "🚀 Backend server başlatıldı";
    readonly DATABASE_CONNECTED: "✅ Veritabanı başarıyla bağlandı";
    readonly DATABASE_ERROR: "❌ Veritabanı bağlantı hatası";
    readonly SYNC_STARTED: "🔄 Veri senkronizasyonu başlatıldı";
    readonly SYNC_COMPLETED: "✅ Veri senkronizasyonu tamamlandı";
    readonly SYNC_ERROR: "❌ Veri senkronizasyon hatası";
    readonly ORACLE_UPDATE_STARTED: "🔄 Oracle fiyat güncellemesi başlatıldı";
    readonly ORACLE_UPDATE_COMPLETED: "✅ Oracle fiyat güncellemesi tamamlandı";
    readonly ORACLE_UPDATE_ERROR: "❌ Oracle fiyat güncellemesi hatası";
    readonly AUTH_SUCCESS: "🔐 Kimlik doğrulama başarılı";
    readonly AUTH_FAILED: "❌ Kimlik doğrulama başarısız";
};
export declare const SECURITY_CONFIG: {
    readonly API_KEY_LENGTH: 32;
};
export declare const EXTERNAL_API_CONFIG: {
    readonly COINGECKO_TIMEOUT: 10000;
    readonly BINANCE_TIMEOUT: 10000;
    readonly MAX_RETRIES: 3;
    readonly RETRY_DELAY: 1000;
};
//# sourceMappingURL=index.d.ts.map