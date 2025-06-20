import { MemStorage } from './impl/mem';
import { authStorage } from './impl/auth';

// Export the storage implementation
export const storage = new MemStorage();

// Extend the storage with authentication methods
export const auth = authStorage;

// Re-export types for convenience
export * from '@shared/schema';
