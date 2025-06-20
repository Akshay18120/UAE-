import nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import env from '../config/env';
import { logger } from '../config/logger';

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter;
  private templates: Record<string, HandlebarsTemplateDelegate> = {};
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize the Nodemailer transporter
    this.transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      // Disable SSL validation for self-signed certificates in development
      tls: {
        rejectUnauthorized: env.NODE_ENV !== 'development',
      },
    });

    // Verify connection configuration
    this.verifyConnection();
    
    // Load email templates
    this.loadTemplates();
    
    this.isInitialized = true;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP server connection verified');
    } catch (error) {
      logger.error('Error verifying SMTP connection:', error);
      throw new Error('Failed to connect to SMTP server');
    }
  }

  private loadTemplates(): void {
    const templateNames = [
      'verification',
      'password-reset',
      'welcome',
      'notification',
      'invoice',
    ];

    templateNames.forEach((templateName) => {
      try {
        const templatePath = join(
          __dirname,
          '..',
          'templates',
          'emails',
          `${templateName}.hbs`
        );
        
        const template = readFileSync(templatePath, 'utf-8');
        this.templates[templateName] = compile(template);
      } catch (error) {
        logger.error(`Failed to load email template: ${templateName}`, error);
      }
    });
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any> = {}
  ): Promise<EmailTemplate> {
    const template = this.templates[templateName];
    
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Add common variables to all templates
    const templateContext = {
      ...context,
      currentYear: new Date().getFullYear(),
      appName: 'ProcurementPro',
      appUrl: env.CLIENT_URL,
    };

    const html = template(templateContext);
    
    // Create a text version by stripping HTML tags
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      subject: templateContext.subject || 'Notification',
      html,
      text,
    };
  }

  public async sendEmail(
    to: string | string[],
    templateName: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    try {
      const { subject, html, text } = await this.renderTemplate(templateName, context);
      
      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  // Common email methods
  public async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    
    await this.sendEmail(email, 'verification', {
      subject: 'Verify your email address',
      name,
      verificationUrl,
    });
  }

  public async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    
    await this.sendEmail(email, 'password-reset', {
      subject: 'Reset your password',
      name,
      resetUrl,
      expiresIn: '1 hour',
    });
  }

  public async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail(email, 'welcome', {
      subject: 'Welcome to ProcurementPro!',
      name,
      loginUrl: `${env.CLIENT_URL}/login`,
    });
  }
}

// Export a singleton instance
export const emailService = EmailService.getInstance();

export default emailService;
