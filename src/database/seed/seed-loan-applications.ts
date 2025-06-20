import { BaseSeeder } from './base-seeder';

export class LoanApplicationSeeder extends BaseSeeder {
  name = 'LoanApplicationSeeder';
  
  async run(): Promise<void> {
    this.log('Seeding loan applications...');
    
    // Get user IDs
    const users = await this.runQuery<{id: number, role: string}>(
      'SELECT id, role FROM users ORDER BY id'
    );
    
    const businessUser = users.find(u => u.role === 'business_owner');
    
    if (!businessUser) {
      this.log('No business user found, skipping loan applications seeding');
      return;
    }
    
    const loanApplications = [
      {
        user_id: businessUser.id,
        application_number: `APP-${Date.now()}-001`,
        loan_type: 'working_capital',
        requested_amount: '50000.00',
        currency: 'AED',
        purpose: 'Inventory purchase for Q4 season',
        status: 'pending',
        interest_rate: '7.5',
        repayment_term: 12,
        documents: [
          { name: 'Business License', url: '/documents/license.pdf' },
          { name: 'Bank Statement', url: '/documents/statement.pdf' },
        ],
        ai_assessment: {
          score: 78,
          risk_level: 'medium',
          factors: [
            { factor: 'Business Age', score: 85 },
            { factor: 'Revenue Stability', score: 72 },
            { factor: 'Credit History', score: 80 },
          ],
        },
      },
      {
        user_id: businessUser.id,
        application_number: `APP-${Date.now()}-002`,
        loan_type: 'supply_chain',
        requested_amount: '125000.00',
        currency: 'AED',
        purpose: 'Supply chain financing for electronics import',
        status: 'approved',
        interest_rate: '6.2',
        repayment_term: 18,
        approval_date: new Date(),
        documents: [
          { name: 'Purchase Order', url: '/documents/po.pdf' },
          { name: 'Supplier Contract', url: '/documents/contract.pdf' },
        ],
        ai_assessment: {
          score: 85,
          risk_level: 'low',
          factors: [
            { factor: 'Purchase Order Value', score: 90 },
            { factor: 'Supplier Reputation', score: 88 },
            { factor: 'Market Demand', score: 82 },
          ],
        },
      },
    ];
    
    // Insert loan applications
    for (const app of loanApplications) {
      const existingApp = await this.runQuery(
        'SELECT id FROM loan_applications WHERE application_number = $1',
        [app.application_number]
      );
      
      if (existingApp.length === 0) {
        await this.runQuery(
          `INSERT INTO loan_applications (
            user_id, application_number, loan_type, requested_amount, currency,
            purpose, status, interest_rate, repayment_term, documents,
            ai_assessment, approval_date, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
          [
            app.user_id,
            app.application_number,
            app.loan_type,
            app.requested_amount,
            app.currency,
            app.purpose,
            app.status,
            app.interest_rate,
            app.repayment_term,
            JSON.stringify(app.documents),
            JSON.stringify(app.ai_assessment),
            app.approval_date || null,
          ]
        );
        this.log(`Created loan application: ${app.application_number}`);
      } else {
        this.log(`Loan application already exists: ${app.application_number}`);
      }
    }
    
    this.log('Finished seeding loan applications');
  }
}

export const loanApplicationSeeder = new LoanApplicationSeeder();
