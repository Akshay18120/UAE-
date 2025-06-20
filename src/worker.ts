import 'reflect-metadata';
import { config } from 'dotenv';
import { emailQueue } from './queues/email.queue';
import { reportQueue } from './queues/report.queue';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import { Server } from 'http';

// Load environment variables
config();

// Setup Bull Dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(emailQueue, { allowRetries: true }),
    new BullAdapter(reportQueue, { allowRetries: true }),
  ],
  serverAdapter,
});

const app = express();
app.use('/admin/queues', serverAdapter.getRouter());

// Start the worker server
const PORT = process.env.WORKER_PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Worker process running on port ${PORT}`);
  console.log(`Bull Dashboard available at http://localhost:${PORT}/admin/queues`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down worker...');
  server.close(() => {
    console.log('Worker process terminated');
    process.exit(0);
  });
});

// Log queue events
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

reportQueue.on('error', (error) => {
  console.error('Report queue error:', error);
});

console.log('Worker started. Waiting for jobs...');
