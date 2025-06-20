import { db } from '../config/database';
import { logger } from '../../config/logger';

export abstract class BaseSeeder {
  abstract name: string;
  
  protected async runQuery<T = any>(query: string, values: any[] = []): Promise<T[]> {
    try {
      const result = await db.execute(query, values);
      return result.rows as T[];
    } catch (error) {
      logger.error(`Error in ${this.name} seeder:`, error);
      throw error;
    }
  }
  
  abstract run(): Promise<void>;
  
  protected log(message: string): void {
    logger.info(`[${this.name}] ${message}`);
  }
  
  protected error(message: string, error?: Error): void {
    logger.error(`[${this.name}] ${message}`, { error });
  }
}
