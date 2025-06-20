import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function performanceMonitor() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const startMemory = process.memoryUsage().heapUsed;
    
    // Capture the original end method
    const originalEnd = res.end;
    
    // Override the end method to capture the response time
    res.end = function (chunk: any, encoding?: any) {
      if (res.finished) return originalEnd.call(res, chunk, encoding);
      
      const diff = process.hrtime(start);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); // in ms
      
      // Calculate memory usage
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsed = ((endMemory - startMemory) / 1024 / 1024).toFixed(2); // in MB
      
      // Log performance metrics
      logger.info('Performance metrics', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        memoryUsed: `${memoryUsed}MB`,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
      
      // Call the original end method
      return originalEnd.call(res, chunk, encoding);
    };
    
    next();
  };
}

// Middleware to track slow requests
export function slowRequestLogger(thresholdMs: number = 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    
    const originalEnd = res.end;
    res.end = function (chunk: any, encoding?: any) {
      if (res.finished) return originalEnd.call(res, chunk, encoding);
      
      const diff = process.hrtime(start);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // in ms
      
      if (responseTime > thresholdMs) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          responseTime: `${responseTime.toFixed(2)}ms`,
          threshold: `${thresholdMs}ms`,
          timestamp: new Date().toISOString(),
        });
      }
      
      return originalEnd.call(res, chunk, encoding);
    };
    
    next();
  };
}

// Middleware to add performance headers
export function addPerformanceHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      // Add Server-Timing header
      res.setHeader('Server-Timing', `total;dur=${responseTime}`);
      
      // Add X-Response-Time header
      res.setHeader('X-Response-Time', `${responseTime}ms`);
    });
    
    next();
  };
}

// Middleware to limit request body size
export function limitRequestSize(limit: string = '1mb') {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const limitInBytes = toBytes(limit);
      
      if (size > limitInBytes) {
        return res.status(413).json({
          success: false,
          message: `Request body size exceeds the limit of ${limit}`,
        });
      }
    }
    
    next();
  };
}

// Helper function to convert size string to bytes
function toBytes(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.match(/^(\d+)([kmg]?b?)?$/i);
  
  if (!match) {
    throw new Error('Invalid size format');
  }
  
  const [, value, unit] = match;
  const unitKey = (unit || 'b').toLowerCase().replace('b', '');
  
  if (!(unitKey in units)) {
    throw new Error(`Invalid unit: ${unit}`);
  }
  
  return parseInt(value, 10) * (units[unitKey] || 1);
}
