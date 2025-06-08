import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertLoanApplicationSchema, insertDocumentSchema, insertCommunityLoanSchema } from "@shared/schema";
import { z } from "zod";

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
  // User registration
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Generate initial credit assessment
      const creditAssessment = calculateCreditScore(user);
      await storage.createCreditAssessment({
        userId: user.id,
        assessmentType: "ai_scoring",
        score: creditAssessment.score,
        factors: creditAssessment.factors,
        recommendations: [],
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });
      
      // Update user with credit score
      await storage.updateUser(user.id, {
        creditScore: creditAssessment.score,
        riskLevel: creditAssessment.riskLevel
      });
      
      res.status(201).json({ ...user, creditScore: creditAssessment.score, riskLevel: creditAssessment.riskLevel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login
  app.post("/api/users/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create loan application
  app.post("/api/loan-applications", async (req, res) => {
    try {
      const applicationData = insertLoanApplicationSchema.parse(req.body);
      
      // Get user for AI assessment
      const user = await storage.getUser(applicationData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const application = await storage.createLoanApplication(applicationData);
      
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
      
      // Update application with AI assessment
      const updatedApplication = await storage.updateLoanApplication(application.id, {
        aiAssessment,
        status: creditAssessment.score >= 600 ? "reviewing" : "rejected",
        interestRate: creditAssessment.score >= 750 ? "8.5" : creditAssessment.score >= 650 ? "12.0" : "15.5"
      });
      
      res.status(201).json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get loan applications for user
  app.get("/api/users/:userId/loan-applications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const applications = await storage.getLoanApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific loan application
  app.get("/api/loan-applications/:id", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getLoanApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update loan application status
  app.patch("/api/loan-applications/:id", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const updates = req.body;
      
      const application = await storage.updateLoanApplication(applicationId, updates);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload document
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user documents
  app.get("/api/users/:userId/documents", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community loan
  app.post("/api/community-loans", async (req, res) => {
    try {
      const loanData = insertCommunityLoanSchema.parse(req.body);
      const loan = await storage.createCommunityLoan(loanData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get community loans
  app.get("/api/community-loans", async (req, res) => {
    try {
      const loans = await storage.getCommunityLoans();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get credit assessment for user
  app.get("/api/users/:userId/credit-assessment", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const assessment = await storage.getLatestCreditAssessment(userId);
      
      if (!assessment) {
        return res.status(404).json({ message: "No credit assessment found" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard data endpoint
  app.get("/api/users/:userId/dashboard", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const applications = await storage.getLoanApplicationsByUser(userId);
      const documents = await storage.getDocumentsByUser(userId);
      const transactions = await storage.getFundingTransactionsByUser(userId);
      const creditAssessment = await storage.getLatestCreditAssessment(userId);
      
      // Calculate dashboard metrics
      const activeApplications = applications.filter(app => 
        ["pending", "reviewing"].includes(app.status || "")
      ).length;
      
      const totalFunded = transactions
        .filter(tx => tx.transactionType === "disbursement" && tx.status === "completed")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      const dashboardData = {
        user,
        metrics: {
          activeApplications,
          totalFunded,
          creditScore: user.creditScore || 0,
          availableCredit: user.creditScore ? Math.floor((user.creditScore - 300) * 5000) : 0
        },
        recentApplications: applications.slice(0, 5),
        recentDocuments: documents.slice(0, 3),
        recentTransactions: transactions.slice(0, 5),
        creditAssessment
      };
      
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
