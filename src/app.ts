import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from 'dotenv';
import { logger, requestLogger } from './config/logger';
import { errorHandler, notFoundHandler, handleUncaughtException, handleUnhandledRejection } from './middleware/error-handler.middleware';
import { performanceMonitor, slowRequestLogger, addPerformanceHeaders, limitRequestSize } from './middleware/performance.middleware';
import { corsHandler } from './middleware/error-handler.middleware';
import { rateLimit } from 'express-rate-limit';
import { setupSwagger } from './config/swagger';
import { redis } from './config/redis';
import { db } from './config/database';

// Load environment variables
config();

class App {
  public app: Application;
  public port: number | string;

  constructor(port: number | string) {
    this.app = express();
    this.port = port;

    this.initializeErrorHandling();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandler();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(corsHandler());
    
    // Request parsing
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    
    // Request validation
    this.app.use(limitRequestSize('10mb'));
    
    // Performance monitoring
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(performanceMonitor());
      this.app.use(slowRequestLogger(1000)); // Log requests slower than 1s
      this.app.use(addPerformanceHeaders());
    }
    
    // Request logging
    this.app.use(requestLogger);
    
    // Rate limiting
    if (process.env.NODE_ENV === 'production') {
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
      });
      this.app.use(limiter);
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        database: 'connected', // TODO: Add actual DB connection check
        redis: redis.isConnected ? 'connected' : 'disconnected',
      });
    });

    // API routes
    this.app.use('/api/v1', (req, res, next) => {
      // API versioning
      req.apiVersion = 'v1';
      next();
    }, require('../api/v1/routes').default);
    
    // 404 handler for unhandled routes
    this.app.use(notFoundHandler);
  }

  private initializeSwagger(): void {
    if (process.env.NODE_ENV !== 'production') {
      setupSwagger(this.app);
    }
  }

  private initializeErrorHandler(): void {
    // Handle 404 errors
    this.app.use((req, res, next) => {
      const error = new Error(`Not Found - ${req.originalUrl}`);
      res.status(404);
      next(error);
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeErrorHandling(): void {
    // Handle uncaught exceptions
    handleUncaughtException();
    
    // Handle unhandled promise rejections
    handleUnhandledRejection();
    
    // Handle process signals
    process.on('SIGTERM', this.gracefulShutdown);
    process.on('SIGINT', this.gracefulShutdown);
  }

  private gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    
    try {
      // Close Redis connection
      if (redis.isConnected) {
        await redis.disconnect();
        logger.info('Redis connection closed');
      }
      
      // Close database connection
      // await db.close(); // Uncomment when you have a database connection
      
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      logger.info(`Server is running on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`API Documentation: http://localhost:${this.port}/api-docs`);
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }
}

export default App;
