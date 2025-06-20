#!/usr/bin/env node
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from '../src/config/database';
import { logger } from '../src/config/logger';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

async function testConnection() {
  try {
    logger.info('Testing database connection...');
    
    // Test connection
    const result = await db.execute('SELECT NOW() as now');
    logger.info('Database connection successful!', { now: result.rows[0].now });
    
    // Test schema exists
    const tables = await db.execute(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'`
    );
    
    logger.info('Database tables:', { tables: tables.rows });
    
    process.exit(0);
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
