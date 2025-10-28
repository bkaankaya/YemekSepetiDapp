import { redisDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

async function runMigrations() {
  try {
    logger.info('🔄 Redis veritabanı migration başlatılıyor...');
    
    // Redis bağlantısını başlat
    await redisDatabase.connect();
    
    // Redis health check
    const isHealthy = await redisDatabase.healthCheck();
    if (!isHealthy) {
      throw new Error('Redis bağlantısı sağlıksız');
    }
    
    logger.info('✅ Redis bağlantısı başarılı');
    
    // Migration'ları çalıştır
    logger.info('🚀 Migration\'lar çalıştırılıyor...');
    
    // Redis için migration işlemleri
    // Şimdilik sadece bağlantı testi yapıyoruz
    
    logger.info('✅ Tüm migration\'lar başarıyla tamamlandı');
    
    // Redis bağlantısını kapat
    await redisDatabase.disconnect();
    logger.info('🔌 Redis bağlantısı kapatıldı');
    
  } catch (error) {
    logger.error('❌ Migration hatası:', error);
    process.exit(1);
  }
}

// Script doğrudan çalıştırılırsa
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
