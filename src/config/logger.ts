import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), consoleFormat)
  ),
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    })
  );
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique request ID
  const requestId = uuidv4();
  
  // Store the request ID in the request object
  (req as any).id = requestId;
  
  // Log the incoming request
  const start = Date.now();
  
  // Log response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    // Skip health check logging in production to reduce noise
    if (process.env.NODE_ENV === 'production' && originalUrl === '/health') {
      return;
    }
    
    // Log the request details
    logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, {
      requestId,
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).id || 'unknown';
  
  logger.error(err.message, {
    requestId,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: (req as any).user ? { id: (req as any).user.id } : undefined,
  });
  
  next(err);
};

export { logger };

// Example usage:
// logger.info('Info message');
// logger.warn('Warning message');
// logger.error('Error message', { error: new Error('Something went wrong') });
