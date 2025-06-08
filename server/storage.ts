import { 
  users, 
  loanApplications, 
  documents, 
  communityLoans, 
  fundingTransactions, 
  creditAssessments,
  type User, 
  type InsertUser,
  type LoanApplication,
  type InsertLoanApplication,
  type Document,
  type InsertDocument,
  type CommunityLoan,
  type InsertCommunityLoan,
  type FundingTransaction,
  type CreditAssessment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Loan application operations
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  getLoanApplication(id: number): Promise<LoanApplication | undefined>;
  getLoanApplicationsByUser(userId: number): Promise<LoanApplication[]>;
  updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication | undefined>;
  getAllLoanApplications(): Promise<LoanApplication[]>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  getDocumentsByApplication(applicationId: number): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  
  // Community loan operations
  createCommunityLoan(loan: InsertCommunityLoan): Promise<CommunityLoan>;
  getCommunityLoans(): Promise<CommunityLoan[]>;
  getCommunityLoan(id: number): Promise<CommunityLoan | undefined>;
  updateCommunityLoan(id: number, updates: Partial<CommunityLoan>): Promise<CommunityLoan | undefined>;
  
  // Credit assessment operations
  createCreditAssessment(assessment: Omit<CreditAssessment, 'id' | 'createdAt'>): Promise<CreditAssessment>;
  getCreditAssessmentsByUser(userId: number): Promise<CreditAssessment[]>;
  getLatestCreditAssessment(userId: number): Promise<CreditAssessment | undefined>;
  
  // Funding transaction operations
  createFundingTransaction(transaction: Omit<FundingTransaction, 'id' | 'createdAt'>): Promise<FundingTransaction>;
  getFundingTransactionsByUser(userId: number): Promise<FundingTransaction[]>;
  getFundingTransactionsByApplication(applicationId: number): Promise<FundingTransaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loanApplications: Map<number, LoanApplication>;
  private documents: Map<number, Document>;
  private communityLoans: Map<number, CommunityLoan>;
  private fundingTransactions: Map<number, FundingTransaction>;
  private creditAssessments: Map<number, CreditAssessment>;
  private currentUserId: number;
  private currentApplicationId: number;
  private currentDocumentId: number;
  private currentCommunityLoanId: number;
  private currentTransactionId: number;
  private currentAssessmentId: number;

  constructor() {
    this.users = new Map();
    this.loanApplications = new Map();
    this.documents = new Map();
    this.communityLoans = new Map();
    this.fundingTransactions = new Map();
    this.creditAssessments = new Map();
    this.currentUserId = 1;
    this.currentApplicationId = 1;
    this.currentDocumentId = 1;
    this.currentCommunityLoanId = 1;
    this.currentTransactionId = 1;
    this.currentAssessmentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      creditScore: null,
      riskLevel: null,
      createdAt: new Date(),
      tradeLicense: insertUser.tradeLicense || null,
      establishedYear: insertUser.establishedYear || null,
      employeeCount: insertUser.employeeCount || null,
      monthlyRevenue: insertUser.monthlyRevenue || null,
      preferredLanguage: insertUser.preferredLanguage || "en",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Loan application operations
  async createLoanApplication(insertApplication: InsertLoanApplication): Promise<LoanApplication> {
    const id = this.currentApplicationId++;
    const applicationNumber = `CF${Date.now()}${id}`;
    const application: LoanApplication = {
      ...insertApplication,
      id,
      applicationNumber,
      status: "pending",
      aiAssessment: null,
      approvalDate: null,
      fundingDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: insertApplication.documents || null,
      currency: insertApplication.currency || "AED",
      repaymentTerm: insertApplication.repaymentTerm || null,
      interestRate: null,
    };
    this.loanApplications.set(id, application);
    return application;
  }

  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    return this.loanApplications.get(id);
  }

  async getLoanApplicationsByUser(userId: number): Promise<LoanApplication[]> {
    return Array.from(this.loanApplications.values()).filter(app => app.userId === userId);
  }

  async updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication | undefined> {
    const application = this.loanApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates, updatedAt: new Date() };
    this.loanApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getAllLoanApplications(): Promise<LoanApplication[]> {
    return Array.from(this.loanApplications.values());
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      uploadDate: new Date(),
      status: "pending",
      applicationId: insertDocument.applicationId || null,
      fileSize: insertDocument.fileSize || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.applicationId === applicationId);
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  // Community loan operations
  async createCommunityLoan(insertLoan: InsertCommunityLoan): Promise<CommunityLoan> {
    const id = this.currentCommunityLoanId++;
    const loan: CommunityLoan = {
      ...insertLoan,
      id,
      lenderId: null,
      status: "open",
      fundedAmount: "0",
      createdAt: new Date(),
      description: insertLoan.description || null,
      collateral: insertLoan.collateral || null,
      fundingTarget: insertLoan.fundingTarget || null,
    };
    this.communityLoans.set(id, loan);
    return loan;
  }

  async getCommunityLoans(): Promise<CommunityLoan[]> {
    return Array.from(this.communityLoans.values());
  }

  async getCommunityLoan(id: number): Promise<CommunityLoan | undefined> {
    return this.communityLoans.get(id);
  }

  async updateCommunityLoan(id: number, updates: Partial<CommunityLoan>): Promise<CommunityLoan | undefined> {
    const loan = this.communityLoans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, ...updates };
    this.communityLoans.set(id, updatedLoan);
    return updatedLoan;
  }

  // Credit assessment operations
  async createCreditAssessment(assessmentData: Omit<CreditAssessment, 'id' | 'createdAt'>): Promise<CreditAssessment> {
    const id = this.currentAssessmentId++;
    const assessment: CreditAssessment = {
      ...assessmentData,
      id,
      createdAt: new Date(),
    };
    this.creditAssessments.set(id, assessment);
    return assessment;
  }

  async getCreditAssessmentsByUser(userId: number): Promise<CreditAssessment[]> {
    return Array.from(this.creditAssessments.values()).filter(assessment => assessment.userId === userId);
  }

  async getLatestCreditAssessment(userId: number): Promise<CreditAssessment | undefined> {
    const assessments = await this.getCreditAssessmentsByUser(userId);
    return assessments.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))[0];
  }

  // Funding transaction operations
  async createFundingTransaction(transactionData: Omit<FundingTransaction, 'id' | 'createdAt'>): Promise<FundingTransaction> {
    const id = this.currentTransactionId++;
    const transaction: FundingTransaction = {
      ...transactionData,
      id,
      createdAt: new Date(),
    };
    this.fundingTransactions.set(id, transaction);
    return transaction;
  }

  async getFundingTransactionsByUser(userId: number): Promise<FundingTransaction[]> {
    return Array.from(this.fundingTransactions.values()).filter(tx => tx.userId === userId);
  }

  async getFundingTransactionsByApplication(applicationId: number): Promise<FundingTransaction[]> {
    return Array.from(this.fundingTransactions.values()).filter(tx => tx.applicationId === applicationId);
  }
}

export const storage = new MemStorage();
