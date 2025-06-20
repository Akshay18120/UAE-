import { cacheService } from '../services/cache.service';

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  key?: string | ((...args: any[]) => string);
};

export function Cacheable(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      let cacheKey: string;
      
      if (typeof options.key === 'function') {
        cacheKey = options.key.apply(this, args);
      } else if (options.key) {
        cacheKey = options.key;
      } else {
        // Default key format: ClassName:methodName:args
        const className = target.constructor.name;
        const argsKey = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(':');
        cacheKey = `${className}:${propertyKey}:${argsKey}`;
      }
      
      // Try to get from cache
      try {
        const cached = await cacheService.get(cacheKey, options);
        
        if (cached !== null && cached !== undefined) {
          return cached;
        }
      } catch (error) {
        console.error(`Cache read error for key ${cacheKey}:`, error);
        // Continue to execute the original method if cache read fails
      }
      
      // Execute the original method and cache the result
      const result = await originalMethod.apply(this, args);
      
      // Only cache if the result is not null or undefined
      if (result !== null && result !== undefined) {
        try {
          await cacheService.set(cacheKey, result, options);
        } catch (error) {
          console.error(`Cache write error for key ${cacheKey}:`, error);
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
}

export function InvalidateCache(keys: string | string[] | ((...args: any[]) => string | string[])) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Execute the original method
      const result = await originalMethod.apply(this, args);
      
      // Determine which keys to invalidate
      let keysToInvalidate: string[] = [];
      
      if (typeof keys === 'function') {
        const keyResult = keys.apply(this, args);
        keysToInvalidate = Array.isArray(keyResult) ? keyResult : [keyResult];
      } else {
        keysToInvalidate = Array.isArray(keys) ? keys : [keys];
      }
      
      // Invalidate each key
      await Promise.all(
        keysToInvalidate.map(key => 
          cacheService.invalidate(key).catch(error => 
            console.error(`Cache invalidation error for key ${key}:`, error)
          )
        )
      );
      
      return result;
    };
    
    return descriptor;
  };
}
