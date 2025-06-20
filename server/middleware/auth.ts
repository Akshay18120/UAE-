import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { storage } from '../storage';
import type { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// JWT Secret - In production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Role-based access control
export const ROLES = {
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
  LENDER: 'lender',
  GUEST: 'guest',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Generate JWT token
export const generateToken = (userId: number, role: Role = ROLES.BUSINESS_OWNER): string => {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = verifyToken(token) as { id: number } | null;
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user from database
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Role-based access control middleware
export const authorize = (roles: Role[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRole = req.user.role as Role;
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    next();
  };
};

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply security headers
export const applySecurityHeaders = (app: any) => {
  // Enable CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Set security HTTP headers
  app.use(helmet());
  
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, hashedPassword);
};
