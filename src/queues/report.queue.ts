import Queue from 'bull';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { config } from 'dotenv';
import { createObjectCsvStringifier } from 'csv-writer';

// Load environment variables
config();

// Promisify pipeline for async/await
const pipelineAsync = promisify(pipeline);

// Report queue
const reportQueue = new Queue('report', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // 10 seconds
    },
    removeOnComplete: true,
    removeOnFail: 100, // Keep last 100 failed jobs for debugging
  },
});

// Process report generation jobs
reportQueue.process(async (job) => {
  const { type, userId, format = 'csv', filters } = job.data;
  
  try {
    // In a real app, you would fetch data from the database based on the report type
    let data: any[] = [];
    let headers: { id: string; title: string }[] = [];
    
    // Simulate different report types
    switch (type) {
      case 'transactions':
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'date', title: 'Date' },
          { id: 'amount', title: 'Amount' },
          { id: 'type', title: 'Type' },
          { id: 'status', title: 'Status' },
        ];
        // In a real app, fetch transactions from the database
        data = [];
        break;
        
      case 'loans':
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'amount', title: 'Amount' },
          { id: 'status', title: 'Status' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'dueDate', title: 'Due Date' },
        ];
        // In a real app, fetch loans from the database
        data = [];
        break;
        
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
    
    // Generate report file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}-report-${timestamp}.${format}`;
    const filepath = join(process.cwd(), 'reports', filename);
    
    // Ensure reports directory exists
    const fs = await import('fs');
    const reportsDir = join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Generate report based on format
    if (format === 'csv') {
      const csvWriter = createObjectCsvStringifier({ header: headers });
      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(data);
      await fs.promises.writeFile(filepath, csvContent);
    } else if (format === 'json') {
      await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    // In a real app, you might want to:
    // 1. Store the report metadata in the database
    // 2. Send an email to the user with a download link
    // 3. Clean up old reports
    
    return {
      success: true,
      filename,
      filepath,
      reportType: type,
      recordCount: data.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error generating ${type} report:`, error);
    throw error; // Will trigger a retry if attempts < maxAttempts
  }
});

// Handle completed jobs
reportQueue.on('completed', (job, result) => {
  console.log(`Report job ${job.id} completed:`, result.filename);
  
  // In a real app, you might want to notify the user that their report is ready
  // and provide a download link
});

// Handle failed jobs
reportQueue.on('failed', (job, error) => {
  console.error(`Report job ${job?.id} failed:`, error);
  
  // In a real app, you might want to notify an admin about the failure
});

export { reportQueue };

// Helper functions to add jobs to the queue
export const generateTransactionsReport = (userId: number, filters: any = {}) => {
  return reportQueue.add('transactions', {
    type: 'transactions',
    userId,
    format: 'csv',
    filters,
  });
};

export const generateLoansReport = (userId: number, filters: any = {}) => {
  return reportQueue.add('loans', {
    type: 'loans',
    userId,
    format: 'csv',
    filters,
  });
};
