import { DataSource } from 'typeorm';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: join(__dirname, '../../database.sqlite'),
  synchronize: true, // Development için true, production'da false olmalı
  logging: false,
  entities: [join(__dirname, '../entities/**/*.ts')],
  migrations: [join(__dirname, '../database/migrations/**/*.ts')],
  subscribers: [join(__dirname, '../subscribers/**/*.ts')],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Veritabanı başarıyla bağlandı');
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    throw error;
  }
};
