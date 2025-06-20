#!/usr/bin/env node
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const command = process.argv[2];
const args = process.argv.slice(3);

async function run() {
  try {
    switch (command) {
      case 'migrate:generate':
        if (!args[0]) {
          throw new Error('Migration name is required');
        }
        generateMigration(args[0]);
        break;
      
      case 'migrate:up':
        runMigrations('up');
        break;
      
      case 'migrate:down':
        runMigrations('down');
        break;
      
      case 'migrate:create':
        createMigrationFile(args[0]);
        break;
      
      case 'db:seed':
        runSeeder();
        break;
      
      case 'db:reset':
        await resetDatabase();
        break;
      
      default:
        console.log(`
Database management commands:

  migrate:generate <name>  Generate a new migration
  migrate:up             Run pending migrations
  migrate:down           Rollback the latest migration
  migrate:create <name>  Create a new migration file
  db:seed               Run database seeders
  db:reset              Reset the database (drop, create, migrate, seed)
`);
        process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function generateMigration(name: string) {
  console.log(`Generating migration: ${name}`);
  execSync(`npx drizzle-kit generate:pg --config drizzle.config.ts --name ${name}`, {
    stdio: 'inherit',
  });
}

function runMigrations(direction: 'up' | 'down') {
  console.log(`Running migrations: ${direction}`);
  execSync(`npx drizzle-kit ${direction} --config drizzle.config.ts`, {
    stdio: 'inherit',
  });
}

function createMigrationFile(name: string) {
  if (!name) {
    throw new Error('Migration name is required');
  }
  
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const fileName = `${timestamp}_${name}.ts`;
  const migrationPath = join(__dirname, '../migrations', fileName);
  
  const template = `import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../../src/config/database';

export async function up() {
  await db.execute(sql\`
    -- Add your SQL statements here
    -- Example: CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
  \`);
}

export async function down() {
  await db.execute(sql\`
    -- Add rollback SQL here
    -- Example: DROP TABLE IF EXISTS users;
  \`);
}
`;
  
  require('fs').writeFileSync(migrationPath, template);
  console.log(`Created migration: ${migrationPath}`);
}

async function runSeeder() {
  console.log('Running seeders...');
  // Import and run seeders
  const { seedDatabase } = await import('../src/database/seed');
  await seedDatabase();
  console.log('Database seeded successfully');
}

async function resetDatabase() {
  console.log('Resetting database...');
  
  // 1. Drop and recreate the database (requires manual confirmation)
  console.log('This will drop all data in the database. Are you sure? (y/n)');
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    readline.question('> ', resolve);
  });
  
  readline.close();
  
  if (answer.toLowerCase() !== 'y') {
    console.log('Aborted');
    process.exit(0);
  }
  
  // 2. Run migrations
  console.log('Running migrations...');
  runMigrations('up');
  
  // 3. Run seeders
  await runSeeder();
  
  console.log('Database reset complete');
}

// Run the command
run();
