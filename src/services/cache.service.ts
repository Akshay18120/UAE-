import { redis } from '../config/redis';
import { logger } from '../config/logger';

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  prefix?: string;
};

export class CacheService {
  private static instance: CacheService;
  private defaultTtl: number = 3600; // 1 hour default
  private prefix: string = 'procurement_pro';

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getKey(key: string, prefix?: string): string {
    return `${this.prefix}:${prefix || 'cache'}:${key}`;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const cacheKey = this.getKey(key, options?.prefix);
      const data = await redis.get(cacheKey);
      
      if (!data) return null;
      
      try {
        return JSON.parse(data);
      } catch (error) {
        logger.warn('Failed to parse cached data', { key: cacheKey, error });
        return null;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return null; // Fail silently in production
    }
  }

  async set<T>(
    key: string, 
    value: T, 
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key, options?.prefix);
      const ttl = options?.ttl ?? this.defaultTtl;
      const serialized = JSON.stringify(value);
      
      if (ttl > 0) {
        await redis.setEx(cacheKey, ttl, serialized);
      } else {
        await redis.set(cacheKey, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string, prefix?: string): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key, prefix);
      const result = await redis.del(cacheKey);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async clearByPattern(pattern: string): Promise<boolean> {
    try {
      const searchPattern = this.getKey(pattern, '*');
      const keys = await redis.keys(searchPattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache clear by pattern error:', error);
      return false;
    }
  }

  async wrap<T>(
    key: string, 
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    
    logger.debug('Cache miss', { key });
    const result = await fn();
    
    if (result !== undefined && result !== null) {
      await this.set(key, result, options);
    }
    
    return result;
  }

  async invalidate(prefix: string): Promise<boolean> {
    return this.clearByPattern(`*:${prefix}:*`);
  }
}

// Export a singleton instance
export const cacheService = CacheService.getInstance();

export default cacheService;
