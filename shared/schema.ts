import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/SME Business Owners
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  contactPerson: text("contact_person").notNull(),
  phoneNumber: text("phone_number").notNull(),
  tradeLicense: text("trade_license"),
  establishedYear: integer("established_year"),
  employeeCount: integer("employee_count"),
  monthlyRevenue: decimal("monthly_revenue", { precision: 15, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  creditScore: integer("credit_score"),
  riskLevel: text("risk_level"), // low, medium, high
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan Applications
export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  applicationNumber: text("application_number").notNull().unique(),
  loanType: text("loan_type").notNull(), // working_capital, supply_chain, community
  requestedAmount: decimal("requested_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("AED"),
  purpose: text("purpose").notNull(),
  status: text("status").default("pending"), // pending, reviewing, approved, rejected, funded
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  repaymentTerm: integer("repayment_term"), // months
  documents: json("documents"), // array of document URLs/metadata
  aiAssessment: json("ai_assessment"), // AI scoring results
  approvalDate: timestamp("approval_date"),
  fundingDate: timestamp("funding_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  applicationId: integer("application_id"),
  documentType: text("document_type").notNull(), // trade_license, bank_statements, financial_statements, etc.
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  uploadDate: timestamp("upload_date").defaultNow(),
  status: text("status").default("pending"), // pending, verified, rejected
});

// Community Lending
export const communityLoans = pgTable("community_loans", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").notNull(),
  lenderId: integer("lender_id"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  term: integer("term").notNull(), // months
  status: text("status").default("open"), // open, funded, repaying, completed
  description: text("description"),
  collateral: text("collateral"),
  fundingTarget: decimal("funding_target", { precision: 15, scale: 2 }),
  fundedAmount: decimal("funded_amount", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Funding Transactions
export const fundingTransactions = pgTable("funding_transactions", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  userId: integer("user_id").notNull(),
  transactionType: text("transaction_type").notNull(), // disbursement, repayment
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("AED"),
  status: text("status").default("pending"), // pending, completed, failed
  referenceNumber: text("reference_number"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Credit Assessments
export const creditAssessments = pgTable("credit_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assessmentType: text("assessment_type").notNull(), // ai_scoring, manual_review
  score: integer("score").notNull(),
  factors: json("factors"), // detailed scoring factors
  recommendations: json("recommendations"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  creditScore: true,
  riskLevel: true,
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  applicationNumber: true,
  status: true,
  aiAssessment: true,
  approvalDate: true,
  fundingDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
  status: true,
});

export const insertCommunityLoanSchema = createInsertSchema(communityLoans).omit({
  id: true,
  lenderId: true,
  status: true,
  fundedAmount: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type CommunityLoan = typeof communityLoans.$inferSelect;
export type InsertCommunityLoan = z.infer<typeof insertCommunityLoanSchema>;
export type FundingTransaction = typeof fundingTransactions.$inferSelect;
export type CreditAssessment = typeof creditAssessments.$inferSelect;
