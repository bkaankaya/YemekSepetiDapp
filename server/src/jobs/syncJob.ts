import cron from 'node-cron';
import { SubgraphService } from '../services/SubgraphService.js';
import { OracleService } from '../services/OracleService.js';
import { logger } from '../utils/logger.js';

export class SyncJob {
  private subgraphService: SubgraphService;
  private oracleService: OracleService;

  constructor() {
    this.subgraphService = new SubgraphService();
    this.oracleService = new OracleService();
  }

  start() {
    logger.info('🕐 Otomatik senkronizasyon job\'ları başlatılıyor...');

    // Her 5 dakikada bir subgraph verilerini senkronize et
    cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('🔄 Otomatik subgraph senkronizasyonu başlatılıyor...');
        await this.subgraphService.syncAllData();
        logger.info('✅ Otomatik subgraph senkronizasyonu tamamlandı');
      } catch (error) {
        logger.error('❌ Otomatik subgraph senkronizasyon hatası:', error);
      }
    });

    // Her saat başı oracle fiyatlarını güncelle
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('🔄 Otomatik oracle fiyat güncellemesi başlatılıyor...');
        await this.oracleService.updatePricesFromExternalSource();
        logger.info('✅ Otomatik oracle fiyat güncellemesi tamamlandı');
      } catch (error) {
        logger.error('❌ Otomatik oracle fiyat güncellemesi hatası:', error);
      }
    });

    // Her gün gece yarısı tam temizlik
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('🧹 Günlük temizlik işlemi başlatılıyor...');
        // Burada eski log dosyalarını, geçici dosyaları temizleyebilirsiniz
        logger.info('✅ Günlük temizlik işlemi tamamlandı');
      } catch (error) {
        logger.error('❌ Günlük temizlik işlemi hatası:', error);
      }
    });

    logger.info('✅ Otomatik senkronizasyon job\'ları başlatıldı');
  }

  stop() {
    logger.info('🛑 Otomatik senkronizasyon job\'ları durduruluyor...');
    // Cron job'ları durdur
    cron.getTasks().forEach(task => task.stop());
    logger.info('✅ Otomatik senkronizasyon job\'ları durduruldu');
  }
}
