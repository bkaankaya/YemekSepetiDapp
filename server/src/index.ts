import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import services and configs
import { initializeDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { SyncJob } from './jobs/syncJob.js';

// Import routes
import oracleRoutes from './routes/oracle.js';
import dataRoutes from './routes/data.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'YemekSepeti Backend'
  });
});

// API routes
app.use('/api/oracle', oracleRoutes);
app.use('/api/data', dataRoutes);

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Backend server başlatıldı: http://localhost:${PORT}`);
      logger.info(`🔗 Oracle API: http://localhost:${PORT}/api/oracle`);
      logger.info(`📈 Data API: http://localhost:${PORT}/api/data`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    });

    // Start sync jobs
    const syncJob = new SyncJob();
    syncJob.start();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('🛑 Graceful shutdown başlatılıyor...');
      syncJob.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('🛑 Graceful shutdown başlatılıyor...');
      syncJob.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Server başlatılamadı:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
