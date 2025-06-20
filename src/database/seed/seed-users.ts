import { hash } from 'bcryptjs';
import { BaseSeeder } from './base-seeder';
import { users } from '@shared/schema';

export class UserSeeder extends BaseSeeder {
  name = 'UserSeeder';
  
  async run(): Promise<void> {
    this.log('Seeding users...');
    
    // Hash passwords
    const password = await hash('password123', 10);
    const adminPassword = await hash('admin123', 10);
    
    // Insert test users
    const testUsers = [
      {
        email: 'admin@procurementpro.com',
        password: adminPassword,
        businessName: 'Admin User',
        businessType: 'admin',
        contactPerson: 'System Admin',
        phoneNumber: '+971501234567',
        isVerified: true,
        role: 'admin',
        creditScore: 850,
        riskLevel: 'low',
      },
      {
        email: 'business1@example.com',
        password,
        businessName: 'Al Nahda Trading',
        businessType: 'trading',
        contactPerson: 'Ahmed Khan',
        phoneNumber: '+971501234568',
        isVerified: true,
        role: 'business_owner',
        creditScore: 720,
        riskLevel: 'medium',
        tradeLicense: 'TRD12345678',
        establishedYear: 2015,
        employeeCount: 25,
        monthlyRevenue: '500000.00',
      },
      {
        email: 'lender1@example.com',
        password,
        businessName: 'Gulf Finance',
        businessType: 'finance',
        contactPerson: 'Fatima Al Maktoum',
        phoneNumber: '+971501234569',
        isVerified: true,
        role: 'lender',
      },
    ];
    
    // Insert users
    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await this.runQuery(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );
      
      if (existingUser.length === 0) {
        await this.runQuery(
          `INSERT INTO users (
            email, password, business_name, business_type, contact_person, 
            phone_number, is_verified, role, credit_score, risk_level,
            trade_license, established_year, employee_count, monthly_revenue
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            user.email,
            user.password,
            user.businessName,
            user.businessType,
            user.contactPerson,
            user.phoneNumber,
            user.isVerified,
            user.role,
            user.creditScore,
            user.riskLevel,
            user.tradeLicense || null,
            user.establishedYear || null,
            user.employeeCount || null,
            user.monthlyRevenue || null,
          ]
        );
        this.log(`Created user: ${user.email}`);
      } else {
        this.log(`User already exists: ${user.email}`);
      }
    }
    
    this.log('Finished seeding users');
  }
}

export const userSeeder = new UserSeeder();
