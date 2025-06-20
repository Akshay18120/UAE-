import { storage } from '../index';
import { hashPassword, comparePasswords } from '../../middleware/auth';
import { generateToken } from '../../middleware/auth';
import { ROLES } from '../../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../middleware/email';

// Extend the storage with authentication methods
export class AuthStorageExtension {
  // Register a new user with email verification
  async registerUser(userData: any) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with default role
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: ROLES.BUSINESS_OWNER, // Default role
        isVerified: false, // Will be verified via email
        verificationToken: generateToken({ email: userData.email }, '1h'), // 1 hour expiry
      });

      // Send verification email
      await sendVerificationEmail(user.email, user.verificationToken);

      // Don't return sensitive data
      const { password, verificationToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData;
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw error;
    }
  }

  // Verify user's email
  async verifyEmail(token: string) {
    try {
      // In a real app, verify the JWT token
      // For now, just find user by token and mark as verified
      const users = await storage.getAllUsers();
      const user = users.find(u => u.verificationToken === token);
      
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user as verified
      await storage.updateUser(user.id, {
        isVerified: true,
        verificationToken: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is verified
      if (!user.isVerified) {
        throw new Error('Please verify your email address first');
      }

      // Verify password
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        role: user.role || ROLES.BUSINESS_OWNER,
      });

      // Don't return sensitive data
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string) {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist
        return { success: true };
      }

      // Generate reset token (1 hour expiry)
      const resetToken = generateToken({ id: user.id }, '1h');
      
      // Store reset token in user record
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      });

      // Send password reset email
      await sendPasswordResetEmail(user.email, resetToken);

      return { success: true };
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string) {
    try {
      // In a real app, verify the JWT token
      // For now, just find user by token
      const users = await storage.getAllUsers();
      const user = users.find(u => u.resetPasswordToken === token);
      
      if (!user || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }

  // Change password (for authenticated users)
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await comparePasswords(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await storage.updateUser(userId, { password: hashedPassword });

      return { success: true };
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }
}

export const authStorage = new AuthStorageExtension();
