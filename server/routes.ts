import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLoanApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { applySecurityHeaders } from "./middleware/auth";
import authRoutes from "./routes/auth";
import { authenticate, authorize, ROLES } from "./middleware/auth";
import type { User } from "@shared/schema";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User | undefined;
    }
  }
}

// AI Credit Scoring Mock Function
function calculateCreditScore(user: any, bankData?: any): { score: number; factors: any; riskLevel: string } {
  let score = 600; // Base score
  
  // Business age factor
  const currentYear = new Date().getFullYear();
  const businessAge = currentYear - (user.establishedYear || currentYear);
  score += Math.min(businessAge * 20, 100);
  
  // Revenue factor
  const monthlyRevenue = parseFloat(user.monthlyRevenue || "0");
  if (monthlyRevenue > 100000) score += 100;
  else if (monthlyRevenue > 50000) score += 50;
  else if (monthlyRevenue > 20000) score += 25;
  
  // Employee count factor
  if (user.employeeCount > 50) score += 50;
  else if (user.employeeCount > 10) score += 25;
  else if (user.employeeCount > 5) score += 10;
  
  // Business type factor
  const stableBusinessTypes = ["trading", "manufacturing", "services"];
  if (stableBusinessTypes.includes(user.businessType?.toLowerCase())) {
    score += 30;
  }
  
  // Ensure score is within valid range
  score = Math.min(Math.max(score, 300), 850);
  
  const riskLevel = score >= 750 ? "low" : score >= 650 ? "medium" : "high";
  
  const factors = {
    businessAge: { score: Math.min(businessAge * 20, 100), weight: 0.2 },
    revenue: { score: monthlyRevenue > 100000 ? 100 : monthlyRevenue > 50000 ? 50 : 25, weight: 0.3 },
    employeeCount: { score: user.employeeCount > 50 ? 50 : user.employeeCount > 10 ? 25 : 10, weight: 0.2 },
    businessType: { score: stableBusinessTypes.includes(user.businessType?.toLowerCase()) ? 30 : 0, weight: 0.15 },
    verification: { score: user.isVerified ? 50 : 0, weight: 0.15 }
  };
  
  return { score, factors, riskLevel };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security headers and middleware
  applySecurityHeaders(app);
  
  // Auth routes (public)
  app.use("/api/auth", authRoutes);
  
  // Example of a protected route with role-based access
  app.get("/api/admin/users", authenticate, authorize([ROLES.ADMIN]), async (req: Request, res: Response) => {
    try {
      // In a real implementation, you would fetch users from the database
      // For now, we'll return an empty array as a placeholder
      res.json([]);
    } catch (error) {
      console.error('Error in /api/admin/users:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Protected routes (require authentication)
  app.use("/api", authenticate);

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Only allow users to access their own profile unless admin
      if (req.user?.id !== userId && req.user?.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive data before sending response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in GET /api/users/:id:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Loan application routes
  app.post("/api/loan-applications", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const applicationData = insertLoanApplicationSchema.parse({
        ...req.body,
        userId: req.user.id, // Ensure the authenticated user owns the application
      });
      
      // Get user for AI assessment
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real implementation, you would save to the database
      // const application = await storage.createLoanApplication(applicationData);
      
      // Generate AI assessment
      const creditAssessment = calculateCreditScore(user);
      const recommendedAmount = Math.min(
        parseFloat(applicationData.requestedAmount),
        parseFloat(user.monthlyRevenue || "0") * 6 // 6 months revenue
      );
      
      const aiAssessment = {
        creditScore: creditAssessment.score,
        riskLevel: creditAssessment.riskLevel,
        recommendedAmount,
        factors: creditAssessment.factors,
        confidence: creditAssessment.score >= 650 ? "high" : "medium"
      };
      
      // For now, return a success response with the assessment
      res.status(201).json({ 
        message: "Loan application created successfully",
        data: {
          ...applicationData,
          aiAssessment,
          status: creditAssessment.score >= 600 ? "reviewing" : "rejected",
          interestRate: creditAssessment.score >= 750 ? "8.5" : 
                      creditAssessment.score >= 650 ? "12.0" : "15.5"
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Error in POST /api/loan-applications:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get loan applications for current user
  app.get("/api/users/me/loan-applications", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real implementation, you would fetch from the database
      // const applications = await storage.getLoanApplicationsByUser(req.user.id);
      // res.json(applications);
      
      // For now, return an empty array
      res.json([]);
    } catch (error) {
      console.error('Error in GET /api/users/me/loan-applications:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      message: "Something went wrong!",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  // Get specific loan application
  app.get("/api/loan-applications/:id", async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getLoanApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Loan application not found" });
      }

      // Only allow the owner or admin to view the application
      if (req.user?.id !== application.userId && req.user?.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Not authorized to view this application" });
      }

      res.json(application);
    } catch (error) {
      console.error('Error in GET /api/loan-applications/:id:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      message: "Something went wrong!",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  // Create and return HTTP server
  const server = createServer(app);
  return server;
}
