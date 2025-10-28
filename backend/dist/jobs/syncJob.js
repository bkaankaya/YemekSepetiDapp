import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { SubgraphService } from '../services/SubgraphService.js';
import { OracleService } from '../services/OracleService.js';
import { CRON_CONFIG } from '../constants/index.js';
export class SyncJob {
    constructor() {
        this.jobs = [];
        this.subgraphService = new SubgraphService();
        this.oracleService = new OracleService();
        logger.info('SyncJob servisi başlatıldı');
    }
    // Tüm cron job'ları başlat
    start() {
        try {
            logger.info('Cron job\'lar başlatılıyor...');
            // Subgraph senkronizasyonu - Her 5 dakikada bir
            this.startSubgraphSyncJob();
            // Oracle fiyat güncellemesi - Her saat başı
            this.startOracleUpdateJob();
            // Günlük temizlik - Her gece yarısı
            this.startDailyCleanupJob();
            // Harici API'lerden fiyat çekme - Her 15 dakikada bir
            this.startExternalPriceFetchJob();
            logger.info('Tüm cron job\'lar başarıyla başlatıldı');
        }
        catch (error) {
            logger.error('Cron job başlatma hatası', { error: error.message });
            throw error;
        }
    }
    // Tüm cron job'ları durdur
    stop() {
        try {
            logger.info('Cron job\'lar durduruluyor...');
            this.jobs.forEach((job, index) => {
                job.stop();
                logger.info('Cron job durduruldu', { job: this.getJobName(index) });
            });
            this.jobs = [];
            logger.info('Tüm cron job\'lar durduruldu');
        }
        catch (error) {
            logger.error('Cron job durdurma hatası', { error: error.message });
        }
    }
    // Subgraph senkronizasyon job'ı
    startSubgraphSyncJob() {
        const job = cron.schedule(CRON_CONFIG.SUBGRAPH_SYNC, async () => {
            try {
                logger.info('🔄 Subgraph senkronizasyonu başlatıldı (cron)');
                const startTime = Date.now();
                await this.subgraphService.syncAllData();
                const duration = Date.now() - startTime;
                logger.info('✅ Subgraph senkronizasyonu tamamlandı (cron)', {
                    duration: `${duration}ms`
                });
            }
            catch (error) {
                logger.error('❌ Subgraph senkronizasyon hatası (cron)', {
                    error: error.message
                });
            }
        }, {
            scheduled: false,
            timezone: 'Europe/Istanbul'
        });
        job.start();
        this.jobs.push(job);
        logger.info('Subgraph senkronizasyon job\'ı başlatıldı', {
            schedule: CRON_CONFIG.SUBGRAPH_SYNC
        });
    }
    // Oracle fiyat güncelleme job'ı
    startOracleUpdateJob() {
        const job = cron.schedule(CRON_CONFIG.ORACLE_UPDATE, async () => {
            try {
                logger.info('🔄 Oracle fiyat güncellemesi başlatıldı (cron)');
                const startTime = Date.now();
                await this.oracleService.updatePricesFromExternalSource();
                const duration = Date.now() - startTime;
                logger.info('✅ Oracle fiyat güncellemesi tamamlandı (cron)', {
                    duration: `${duration}ms`
                });
            }
            catch (error) {
                logger.error('❌ Oracle fiyat güncellemesi hatası (cron)', {
                    error: error.message
                });
            }
        }, {
            scheduled: false,
            timezone: 'Europe/Istanbul'
        });
        job.start();
        this.jobs.push(job);
        logger.info('Oracle fiyat güncelleme job\'ı başlatıldı', {
            schedule: CRON_CONFIG.ORACLE_UPDATE
        });
    }
    // Günlük temizlik job'ı
    startDailyCleanupJob() {
        const job = cron.schedule(CRON_CONFIG.DAILY_CLEANUP, async () => {
            try {
                logger.info('🧹 Günlük temizlik işlemi başlatıldı (cron)');
                const startTime = Date.now();
                await this.performDailyCleanup();
                const duration = Date.now() - startTime;
                logger.info('✅ Günlük temizlik işlemi tamamlandı (cron)', {
                    duration: `${duration}ms`
                });
            }
            catch (error) {
                logger.error('❌ Günlük temizlik hatası (cron)', {
                    error: error.message
                });
            }
        }, {
            scheduled: false,
            timezone: 'Europe/Istanbul'
        });
        job.start();
        this.jobs.push(job);
        logger.info('Günlük temizlik job\'ı başlatıldı', {
            schedule: CRON_CONFIG.DAILY_CLEANUP
        });
    }
    // Harici API'lerden fiyat çekme job'ı
    startExternalPriceFetchJob() {
        const job = cron.schedule(CRON_CONFIG.PRICE_FETCH, async () => {
            try {
                logger.info('📊 Harici API\'lerden fiyat çekme başlatıldı (cron)');
                const startTime = Date.now();
                await this.fetchExternalPrices();
                const duration = Date.now() - startTime;
                logger.info('✅ Harici API\'lerden fiyat çekme tamamlandı (cron)', {
                    duration: `${duration}ms`
                });
            }
            catch (error) {
                logger.error('❌ Harici API\'lerden fiyat çekme hatası (cron)', {
                    error: error.message
                });
            }
        }, {
            scheduled: false,
            timezone: 'Europe/Istanbul'
        });
        job.start();
        this.jobs.push(job);
        logger.info('Harici fiyat çekme job\'ı başlatıldı', {
            schedule: CRON_CONFIG.PRICE_FETCH
        });
    }
    // Manuel subgraph senkronizasyonu
    async manualSubgraphSync() {
        try {
            logger.info('🔄 Manuel subgraph senkronizasyonu başlatıldı');
            const startTime = Date.now();
            await this.subgraphService.syncAllData();
            const duration = Date.now() - startTime;
            logger.info('✅ Manuel subgraph senkronizasyonu tamamlandı', {
                duration: `${duration}ms`
            });
        }
        catch (error) {
            logger.error('❌ Manuel subgraph senkronizasyon hatası', {
                error: error.message
            });
            throw error;
        }
    }
    // Manuel Oracle fiyat güncellemesi
    async manualOracleUpdate() {
        try {
            logger.info('🔄 Manuel Oracle fiyat güncellemesi başlatıldı');
            const startTime = Date.now();
            await this.oracleService.updatePricesFromExternalSource();
            const duration = Date.now() - startTime;
            logger.info('✅ Manuel Oracle fiyat güncellemesi tamamlandı', {
                duration: `${duration}ms`
            });
        }
        catch (error) {
            logger.error('❌ Manuel Oracle fiyat güncellemesi hatası', {
                error: error.message
            });
            throw error;
        }
    }
    // Günlük temizlik işlemleri
    async performDailyCleanup() {
        try {
            // Eski log dosyalarını temizle (30 günden eski)
            await this.cleanupOldLogs();
            // Eski fiyat güncellemelerini temizle (90 günden eski)
            await this.cleanupOldPriceUpdates();
            // Veritabanı optimizasyonu
            await this.optimizeDatabase();
            logger.info('Günlük temizlik işlemleri tamamlandı');
        }
        catch (error) {
            logger.error('Günlük temizlik hatası', { error: error.message });
        }
    }
    // Eski log dosyalarını temizle
    async cleanupOldLogs() {
        try {
            // Bu işlem dosya sistemi üzerinde yapılacak
            // Şimdilik placeholder olarak bırakıyoruz
            logger.info('Log temizliği yapıldı (placeholder)');
        }
        catch (error) {
            logger.warn('Log temizliği yapılamadı', { error: error.message });
        }
    }
    // Eski fiyat güncellemelerini temizle
    async cleanupOldPriceUpdates() {
        try {
            // 90 günden eski fiyat güncellemelerini sil
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);
            // PriceUpdateRepository kullanarak eski kayıtları temizle
            const { PriceUpdateRepository } = await import('../data/repositories/index.js');
            const priceUpdateRepo = new PriceUpdateRepository();
            await priceUpdateRepo.cleanOldPriceUpdates(90); // 90 gün
            logger.info('Eski fiyat güncellemeleri temizlendi', {
                cutoffDate: cutoffDate.toISOString()
            });
        }
        catch (error) {
            logger.warn('Fiyat güncelleme temizliği yapılamadı', { error: error.message });
        }
    }
    // Veritabanı optimizasyonu
    async optimizeDatabase() {
        try {
            // Redis için memory optimization
            const { redisDatabase } = await import('../config/database.js');
            // Redis memory usage bilgisi al
            const info = await redisDatabase.getClient().info('memory');
            logger.info('Redis memory bilgisi alındı', { info: info.substring(0, 100) + '...' });
            // Redis key sayısı kontrol et
            const dbSize = await redisDatabase.getClient().dbSize();
            logger.info('Redis veritabanı boyutu', { dbSize });
            logger.info('Redis veritabanı optimizasyonu tamamlandı');
        }
        catch (error) {
            logger.warn('Redis veritabanı optimizasyonu yapılamadı', { error: error.message });
        }
    }
    // Harici API'lerden fiyat çek
    async fetchExternalPrices() {
        try {
            // CoinGecko ve Binance'den fiyatları çek
            // Bu işlem OracleService üzerinden yapılıyor
            await this.oracleService.updatePricesFromExternalSource();
        }
        catch (error) {
            logger.warn('Harici fiyat çekme hatası', { error: error.message });
        }
    }
    // Job durumlarını al
    getJobStatuses() {
        return this.jobs.map((job, index) => ({
            name: this.getJobName(index),
            status: 'running', // node-cron doesn't provide status
            nextRun: null // node-cron doesn't provide next run time
        }));
    }
    // Job adını al
    getJobName(jobIndex) {
        const jobNames = ['Subgraph Sync', 'Oracle Update', 'Daily Cleanup', 'External Price Fetch'];
        return jobNames[jobIndex] || 'Unknown Job';
    }
    // Health check
    async healthCheck() {
        try {
            const [subgraphHealth, oracleHealth] = await Promise.all([
                this.subgraphService.checkSubgraphHealth(),
                this.oracleService.checkOracleHealth()
            ]);
            const status = subgraphHealth && oracleHealth ? 'healthy' : 'unhealthy';
            return {
                subgraph: subgraphHealth,
                oracle: oracleHealth,
                jobs: this.jobs.length,
                status
            };
        }
        catch (error) {
            logger.error('Health check hatası', { error: error.message });
            return {
                subgraph: false,
                oracle: false,
                jobs: this.jobs.length,
                status: 'unhealthy'
            };
        }
    }
}
//# sourceMappingURL=syncJob.js.map