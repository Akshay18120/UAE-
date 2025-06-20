import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError, handleError } from '../errors/app-error';

/**
 * Global error handler middleware
 * This should be the last middleware in the chain
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers have already been sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle the error using our error handling utility
  handleError(err, req, res, next);
}

/**
 * 404 Not Found handler middleware
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Async handler wrapper to catch async/await errors
 * @param fn The async function to wrap
 * @returns A function that handles errors automatically
 */
export function asyncHandler<T extends (...args: any[]) => any>(fn: T) {
  return async function (...args: Parameters<T>) {
    const next = args[args.length - 1];
    
    try {
      // Call the original function
      return await fn(...args);
    } catch (error) {
      // Pass the error to the next middleware
      next(error);
    }
  } as T;
}

/**
 * Middleware to handle unhandled promise rejections
 */
export function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // In production, you might want to restart the process here
    if (process.env.NODE_ENV === 'production') {
      // Consider using a process manager like PM2 to restart the process
      process.exit(1);
    }
  });
}

/**
 * Middleware to handle uncaught exceptions
 */
export function handleUncaughtException() {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    
    // Attempt to perform a graceful shutdown
    process.exit(1);
  });
}

/**
 * Middleware to handle process signals for graceful shutdown
 */
export function handleProcessSignals(server: any) {
  // Graceful shutdown on SIGTERM (e.g., from Docker)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    
    // Close the server first to stop accepting new connections
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close the server after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

/**
 * Middleware to validate request content type
 */
export function validateContentType(allowedTypes: string[] = ['application/json']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next();
    }
    
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        success: false,
        error: {
          type: 'UNSUPPORTED_MEDIA_TYPE',
          message: `Unsupported media type. Expected: ${allowedTypes.join(', ')}`,
          code: 415,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    next();
  };
}

/**
 * Middleware to handle CORS
 */
export function corsHandler() {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];
    
    const origin = req.headers.origin || '';
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
    }
    
    next();
  };
}
