import { cleanEnv, str, num, bool, url, makeValidator } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  override: true,
});

// Custom validators
const emailValidator = makeValidator((value) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Must be a valid email address');
  }
  return value;
});

const databaseUrlValidator = makeValidator((value) => {
  if (!/^postgresql:\/\//.test(value)) {
    throw new Error('Must be a valid PostgreSQL connection string');
  }
  return value;
});

const env = cleanEnv(process.env, {
  // Server
  NODE_ENV: str({
    choices: ['development', 'test', 'production', 'staging'],
    default: 'development',
  }),
  PORT: num({ default: 3000 }),
  WORKER_PORT: num({ default: 3001 }),
  CLIENT_URL: str({ default: 'http://localhost:3000' }),
  API_URL: str({ default: 'http://localhost:3000' }),

  // JWT
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '1d' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),

  // Database
  DATABASE_URL: databaseUrlValidator({
    default: 'postgresql://postgres:postgres@localhost:5432/procurement_pro',
  }),
  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: num({ default: 5432 }),
  DB_NAME: str({ default: 'procurement_pro' }),
  DB_USER: str({ default: 'postgres' }),
  DB_PASSWORD: str({ default: 'postgres' }),
  DB_SSL: bool({ default: false }),

  // Redis
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: num({ default: 6379 }),
  REDIS_PASSWORD: str({ default: '' }),

  // Email
  SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: emailValidator(),
  SMTP_PASSWORD: str(),
  EMAIL_FROM_NAME: str({ default: 'ProcurementPro' }),
  EMAIL_FROM_ADDRESS: emailValidator(),

  // File Uploads
  UPLOAD_DIR: str({ default: './uploads' }),
  MAX_FILE_SIZE: num({ default: 5 * 1024 * 1024 }), // 5MB

  // Logging
  LOG_LEVEL: str({
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
  }),

  // Feature Flags
  FEATURE_EMAIL_VERIFICATION: bool({ default: true }),
  FEATURE_RATE_LIMITING: bool({ default: true }),
  FEATURE_MAINTENANCE_MODE: bool({ default: false }),
});

// Export the validated environment variables
export default env;
