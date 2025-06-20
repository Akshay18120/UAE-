import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import env from './env';
import { logger } from './logger';

type RedisClient = RedisClientType;

export class RedisService {
  private client: RedisClientType;
  private static instance: RedisService;
  private isConnected: boolean = false;
  private pingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    const redisOptions = {
      url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      socket: {
        reconnectStrategy: (retries: number): number | Error => {
          if (retries > 5) {
            logger.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1.6s, 3.2s
          return Math.min(retries * 100, 3200);
        },
      },
    };

    this.client = createClient(redisOptions) as RedisClientType;
    this.setupEventListeners();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis client connected');
      this.startHeartbeat();
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error: Error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      this.stopHeartbeat();
      logger.info('Redis client disconnected');
    });
  }

  private startHeartbeat(intervalMs: number = 30000): void {
    this.stopHeartbeat();
    
    const ping = async () => {
      try {
        await this.client.ping();
      } catch (error) {
        logger.error('Redis heartbeat failed:', error);
      }
    };
    
    // Initial ping
    ping().catch(error => {
      logger.error('Initial Redis ping failed:', error);
    });
    
    // Set up interval
    this.pingInterval = setInterval(ping, intervalMs);
  }
  
  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
 await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      this.stopHeartbeat();
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  // Basic key-value operations
  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, val);
      } else {
        await this.client.set(key, val);
      }
    } catch (error) {
      logger.error(`Redis set error for key ${key}:`, error);
      throw error;
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`Redis get error for key ${key}:`, error);
      throw error;
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Redis delete error for key ${key}:`, error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis exists error for key ${key}:`, error);
      throw error;
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`Redis expire error for key ${key}:`, error);
      throw error;
    }
  }

  // Pub/Sub
  public async publish(channel: string, message: any): Promise<number> {
    try {
      const msg = typeof message === 'string' ? message : JSON.stringify(message);
      return await this.client.publish(channel, msg);
    } catch (error) {
      logger.error(`Redis publish error for channel ${channel}:`, error);
      throw error;
    }
  }

  // Utility methods
  public async flushAll(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      logger.error('Redis flushAll error:', error);
      throw error;
    }
  }

  public async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis ping error:', error);
      throw error;
    }
  }

  public getClient(): RedisClient {
    return this.client;
  }
}

// Create a singleton instance
export const redis: RedisService = RedisService.getInstance();

// Initialize connection when this module is imported
if (process.env.NODE_ENV !== 'test') {
  redis.connect().catch(error => {
    logger.error('Failed to initialize Redis connection:', error);
    process.exit(1);
  });
}

// Handle graceful shutdown
const handleShutdown = async () => {
  try {
    await redis.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during Redis shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// For testing purposes
export const __test__ = {
  clearInstance: () => {
    // @ts-ignore
    RedisService.instance = null;
  }
};

export default redis;
