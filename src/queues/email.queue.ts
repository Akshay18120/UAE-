import Queue from 'bull';
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

// Email queue
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds
    },
  },
});

// Email transporter
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Process email jobs
emailQueue.process(async (job) => {
  const { to, subject, template, context } = job.data;
  
  try {
    // In a real app, you would use a template engine like Handlebars, EJS, etc.
    const html = `
      <div>
        <h1>${subject}</h1>
        <pre>${JSON.stringify(context, null, 2)}</pre>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Will trigger a retry if attempts < maxAttempts
  }
});

// Handle completed jobs
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed`, result);
});

// Handle failed jobs
emailQueue.on('failed', (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error);
});

export { emailQueue };

// Helper functions to add jobs to the queue
export const sendVerificationEmail = (to: string, token: string, name: string) => {
  return emailQueue.add('verification', {
    to,
    subject: 'Verify your email address',
    template: 'verification',
    context: {
      name,
      verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${token}`,
    },
  });
};

export const sendPasswordResetEmail = (to: string, token: string, name: string) => {
  return emailQueue.add('password-reset', {
    to,
    subject: 'Reset your password',
    template: 'password-reset',
    context: {
      name,
      resetLink: `${process.env.CLIENT_URL}/reset-password?token=${token}`,
    },
  });
};

export const sendWelcomeEmail = (to: string, name: string) => {
  return emailQueue.add('welcome', {
    to,
    subject: 'Welcome to Our Platform!',
    template: 'welcome',
    context: {
      name,
      loginLink: `${process.env.CLIENT_URL}/login`,
    },
  });
};
