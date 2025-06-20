import { User } from '@shared/schema';
import { generateToken, verifyToken } from '../server/middleware/auth';
import { storage } from '../server/storage';
import { compare, hash } from 'bcryptjs';
import { BadRequestError, ConflictError, UnauthorizedError } from '../shared/errors';
import { RegisterDto } from '../api/v1/validators/auth.validator';

export class AuthService {
  async register(userData: RegisterDto): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 10);
    
    // Create user in database
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: 'business_owner', // Default role
      emailVerified: false, // Will be set to true after email verification
    });

    // Generate verification token (in a real app, this would be sent via email)
    const verificationToken = generateToken(user.id, 'email_verification');
    
    // In a real app, send verification email here
    console.log('Verification token:', verificationToken);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        throw new BadRequestError('Invalid or expired token');
      }

      const user = await storage.getUser(decoded.id);
      if (!user) {
        throw new BadRequestError('User not found');
      }

      if (user.emailVerified) {
        return true; // Already verified
      }

      // Update user as verified
      await storage.updateUser(user.id, { emailVerified: true });
      return true;
    } catch (error) {
      throw new BadRequestError('Invalid or expired token');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return;
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken(user.id, 'password_reset');
    
    // In a real app, send password reset email here
    console.log('Password reset token:', resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        throw new BadRequestError('Invalid or expired token');
      }

      const user = await storage.getUser(decoded.id);
      if (!user) {
        throw new BadRequestError('User not found');
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      
      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });
    } catch (error) {
      throw new BadRequestError('Invalid or expired token');
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);
    
    // Update user password
    await storage.updateUser(userId, { password: hashedPassword });
  }
}
