import 'reflect-metadata';
import { config } from 'dotenv';
import { createServer, Server } from 'http';
import App from './app';
import { logger } from './config/logger';
import { WebSocketService } from './services/websocket.service';

// Load environment variables
config();

// Initialize the application
const PORT = process.env.PORT || 3000;
const app = new App(PORT);
const server = createServer(app.app);

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to crash the process in production
  if (process.env.NODE_ENV === 'production') {
    // You might want to use a process manager to restart the process
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Consider whether to crash the process in production
  if (process.env.NODE_ENV === 'production') {
    // You might want to use a process manager to restart the process
    process.exit(1);
  }
});

// Handle process signals
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    // Close the server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close the server after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
  }
});

export { server, app };
