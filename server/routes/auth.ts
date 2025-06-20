import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticate, authorize, ROLES } from '../middleware/auth';
import { User } from '@shared/schema';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Mock auth methods - these would be implemented in your storage layer
const auth = {
  registerUser: async (userData: any) => {
    // Implementation would go here
    return userData;
  },
  verifyEmail: async (token: string) => {
    // Implementation would go here
    return true;
  },
  login: async (email: string, password: string) => {
    // Implementation would go here
    return { 
      token: 'mock-jwt-token', 
      user: { id: 1, email, name: 'Test User' } 
    };
  },
  requestPasswordReset: async (email: string) => {
    // Implementation would go here
    return true;
  },
  resetPassword: async (token: string, newPassword: string) => {
    // Implementation would go here
    return true;
  },
  changePassword: async (userId: number, currentPassword: string, newPassword: string) => {
    // Implementation would go here
    return true;
  }
};

const router = Router();

// Input validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  contactPerson: z.string().min(2),
  phoneNumber: z.string().min(8),
  tradeLicense: z.string().optional(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().int().min(1).optional(),
  monthlyRevenue: z.number().min(0).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const userData = registerSchema.parse(req.body);
    const user = await auth.registerUser(userData);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    await auth.verifyEmail(token);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Email verification failed',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await auth.login(email, password);
    
    // Set HTTP-only cookie with JWT token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  // Remove sensitive data before sending
  const { password, ...userWithoutPassword } = req.user;
  res.json({ success: true, user: userWithoutPassword });
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = resetPasswordRequestSchema.parse(req.body);
    await auth.requestPasswordReset(email);
    res.json({ 
      success: true, 
      message: 'If an account with that email exists, you will receive a password reset link' 
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process password reset request',
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await auth.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
    });
  }
});

// Change password (requires authentication)
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await auth.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change password',
    });
  }
});

// Admin-only route to get all users
router.get('/admin/users', 
  authenticate, 
  authorize([ROLES.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      // In a real implementation, you would fetch users from the database
      // For now, return an empty array as a placeholder
      const users: User[] = [];
      
      // Remove sensitive data before sending
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ success: true, users: usersWithoutPasswords });
    } catch (error) {
      console.error('Error in GET /admin/users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }
);

export default router;
