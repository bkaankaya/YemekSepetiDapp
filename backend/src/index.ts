import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { requestLoggingMiddleware, errorHandlerMiddleware, notFoundMiddleware } from './middleware/auth.js';
import oracleRoutes from './routes/oracle.js';
import dataRoutes from './routes/data.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLoggingMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/oracle', oracleRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorHandlerMiddleware);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server başlatıldı`, {
        host: HOST,
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('❌ Server başlatılamadı:', error);
    process.exit(1);
  }
}

startServer();
