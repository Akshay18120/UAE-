import { userSeeder } from './seed-users';
import { loanApplicationSeeder } from './seed-loan-applications';
import { logger } from '../../../config/logger';

// List of all seeders to run (in order)
const seeders = [
  userSeeder,
  loanApplicationSeeder,
  // Add more seeders here
];

export async function seedDatabase() {
  logger.info('Starting database seeding...');
  
  try {
    for (const seeder of seeders) {
      logger.info(`Running seeder: ${seeder.name}`);
      await seeder.run();
    }
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Failed to seed database:', error);
      process.exit(1);
    });
}
