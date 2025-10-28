import { redisDatabase } from '../config/database.js';
import { UserRepository } from '../data/repositories/UserRepository.js';
import { User, UserRole } from '../data/types.js';
import { logger } from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('🌱 Redis veritabanı seed işlemi başlatılıyor...');
    
    // Redis bağlantısını başlat
    await redisDatabase.connect();
    
    // Repository'leri al
    const userRepository = new UserRepository();
    
    // Admin kullanıcısı oluştur
    logger.info('👑 Admin kullanıcısı oluşturuluyor...');
    
    const existingAdmin = await userRepository.findByUsername('admin');
    
    if (!existingAdmin) {
      const adminUser: User = {
        id: 'admin_001',
        username: 'admin',
        email: 'admin@yemeksepeti.com',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await userRepository.save(adminUser);
      
      logger.info('✅ Admin kullanıcısı oluşturuldu', {
        username: 'admin',
        email: 'admin@yemeksepeti.com',
        role: UserRole.ADMIN
      });
    } else {
      logger.info('ℹ️ Admin kullanıcısı zaten mevcut');
    }
    
    // Oracle operator kullanıcısı oluştur
    logger.info('🔧 Oracle operator kullanıcısı oluşturuluyor...');
    
    const existingOperator = await userRepository.findByUsername('oracle_operator');
    
    if (!existingOperator) {
      const operatorUser: User = {
        id: 'oracle_001',
        username: 'oracle_operator',
        email: 'oracle@yemeksepeti.com',
        role: UserRole.ORACLE_OPERATOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await userRepository.save(operatorUser);
      
      logger.info('✅ Oracle operator kullanıcısı oluşturuldu', {
        username: 'oracle_operator',
        email: 'oracle@yemeksepeti.com',
        role: UserRole.ORACLE_OPERATOR
      });
    } else {
      logger.info('ℹ️ Oracle operator kullanıcısı zaten mevcut');
    }
    
    // Test kullanıcısı oluştur
    logger.info('🧪 Test kullanıcısı oluşturuluyor...');
    
    const existingTestUser = await userRepository.findByUsername('testuser');
    
    if (!existingTestUser) {
      const testUser: User = {
        id: 'test_001',
        username: 'testuser',
        email: 'test@yemeksepeti.com',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await userRepository.save(testUser);
      
      logger.info('✅ Test kullanıcısı oluşturuldu', {
        username: 'testuser',
        email: 'test@yemeksepeti.com',
        role: UserRole.USER
      });
    } else {
      logger.info('ℹ️ Test kullanıcısı zaten mevcut');
    }
    
    // Kullanıcı sayısını logla
    const totalUsers = await userRepository.count();
    logger.info(`📊 Toplam kullanıcı sayısı: ${totalUsers}`);
    
    logger.info('✅ Redis veritabanı seed işlemi başarıyla tamamlandı');
    
    // Redis bağlantısını kapat
    await redisDatabase.disconnect();
    logger.info('🔌 Redis bağlantısı kapatıldı');
    
  } catch (error) {
    logger.error('❌ Seed hatası:', error);
    process.exit(1);
  }
}

// Script doğrudan çalıştırılırsa
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
