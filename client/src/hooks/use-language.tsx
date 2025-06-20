import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys - in a real app this would come from translation files
const translations = {
  en: {
    // Header & Navigation
    trustedBy10k: "Trusted by 10,000+ UAE SMEs",
    heroTitle1: "Unlock Working Capital for Your",
    heroTitle2: "SME Business",
    heroDescription: "Access funding through AI-powered credit scoring, supply chain finance, and community lending. Built specifically for UAE entrepreneurs.",
    startApplication: "Start Application",
    watchDemo: "Watch Demo",
    fundingFacilitated: "Funding Facilitated",
    averageApproval: "Average Approval",
    successRate: "Success Rate",
    quickApplication: "Quick Application",
    secure: "Secure",
    businessName: "Business Name",
    enterBusinessName: "Enter your business name",
    fundingAmount: "Funding Amount",
    businessType: "Business Type",
    selectBusinessType: "Select business type",
    trading: "Trading",
    manufacturing: "Manufacturing",
    services: "Services",
    technology: "Technology",
    processing: "Processing...",
    getPreApproved: "Get Pre-Approved",
    secureInfo: "Your information is encrypted and secure",
    
    // Trust & Features
    trustedRegulated: "Trusted and regulated by UAE authorities",
    featuresTitle1: "Everything Your SME Needs to",
    featuresTitle2: "Access Capital",
    featuresDescription: "Our comprehensive platform combines AI-powered credit assessment, supply chain finance, and community lending to unlock funding opportunities.",
    aiCreditScoring: "AI Credit Scoring",
    aiCreditScoringDesc: "Advanced algorithms analyze alternative data sources to assess creditworthiness beyond traditional banking criteria.",
    bankTransactionAnalysis: "Bank transaction analysis",
    socialMediaFootprint: "Social media footprint",
    businessPerformanceMetrics: "Business performance metrics",
    supplyChainFinance: "Supply Chain Finance",
    supplyChainFinanceDesc: "Leverage your supplier relationships and receivables to access immediate working capital.",
    invoiceFactoring: "Invoice factoring",
    purchaseOrderFinancing: "Purchase order financing",
    tradeCreditOptimization: "Trade credit optimization",
    communityLending: "Community Lending",
    communityLendingDesc: "Connect with a network of investors and lenders who understand your business and industry.",
    peerToPeerLending: "Peer-to-peer lending",
    industrySpecificPools: "Industry-specific pools",
    flexibleTerms: "Flexible terms",
    mobileFirstPlatform: "Mobile-First Platform",
    mobileFirstPlatformDesc: "Complete applications, track progress, and manage funding from anywhere using our mobile app.",
    documentScanning: "Document scanning",
    realTimeNotifications: "Real-time notifications",
    offlineCapabilities: "Offline capabilities",
    multiCurrencySupport: "Multi-Currency Support",
    multiCurrencySupportDesc: "Handle transactions in AED, USD, and other major currencies with automatic conversion.",
    realTimeExchangeRates: "Real-time exchange rates",
    hedgingOptions: "Hedging options",
    multiCurrencyWallets: "Multi-currency wallets",
    realTimeDashboard: "Real-Time Dashboard",
    realTimeDashboardDesc: "Monitor your funding pipeline, track applications, and analyze your business metrics in one place.",
    applicationTracking: "Application tracking",
    cashFlowForecasting: "Cash flow forecasting",
    performanceAnalytics: "Performance analytics",
    
    // How It Works
    howItWorksTitle1: "Get Funded in",
    howItWorksTitle2: "4 Simple Steps",
    howItWorksDescription: "Our streamlined process gets you from application to funding faster than traditional banks.",
    step1Title: "Apply Online",
    step1Description: "Complete our simple application form with basic business information and upload required documents.",
    step2Title: "AI Assessment",
    step2Description: "Our AI analyzes your data and generates a comprehensive credit score using alternative data sources.",
    step3Title: "Match & Approve",
    step3Description: "Get matched with the best funding options and receive approval decisions within 72 hours.",
    step4Title: "Receive Funds",
    step4Description: "Access your approved funding directly to your business account and start growing your business.",
    startYourApplication: "Start Your Application",
    averageProcessingTime: "Average processing time: 72 hours",
    
    // CTA
    ctaTitle: "Ready to Unlock Your Business Potential?",
    ctaDescription: "Join thousands of UAE SMEs who have accessed over AED 2.5 billion in funding through our platform. Your growth story starts here.",
    startApplicationNow: "Start Application Now",
    scheduleDemo: "Schedule Demo",
    preApprovedTime: "Get pre-approved in under 5 minutes",
    
    // Footer
    footerDescription: "Empowering UAE SMEs with innovative financing solutions. From AI-powered credit scoring to community lending, we're democratizing access to working capital.",
    solutions: "Solutions",
    workingCapital: "Working Capital",
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    press: "Press",
    contact: "Contact",
    support: "Support",
    helpCenter: "Help Center",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    compliance: "Compliance",
    copyright: "© 2024 CapitalFlow. All rights reserved. Licensed by UAE Central Bank.",
    sslSecured: "SSL Secured",
    
    // Navigation
    pricing: "Pricing",
    resources: "Resources",
    about: "About",
    signIn: "Sign In",
    getStarted: "Get Started",
    
    // Dashboard
    welcomeBack: "Welcome back",
    availableCredit: "Available Credit",
    activeApplications: "Active Applications",
    totalFunded: "Total Funded",
    creditScore: "Credit Score",
    pendingReview: "pending review",
    thisYear: "This year",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    overview: "Overview",
    applications: "Applications",
    documents: "Documents",
    analytics: "Analytics",
    recentActivity: "Recent Activity",
    loanApplications: "Loan Applications",
    aiAssessment: "AI Assessment",
    riskLevel: "Risk Level",
    businessMetrics: "Business Metrics",
    monthlyRevenue: "Monthly Revenue",
    employees: "Employees",
    businessAge: "Business Age",
    fundingStats: "Funding Stats",
    approvedApplications: "Approved Applications",
    userNotFound: "User Not Found",
    userNotFoundDescription: "The requested user could not be found.",
    
    // Application Form
    loanApplication: "Loan Application",
    applicationDescription: "Complete your funding application in just a few simple steps",
    step: "Step",
    of: "of",
    complete: "complete",
    businessInfo: "Business Information",
    loanDetails: "Loan Details",
    review: "Review",
    next: "Next",
    back: "Back",
    loanDetailsForm: "Loan Details Form",
    loanDetailsDescription: "Specify your funding requirements and loan terms",
    applicationSubmitted: "Application Submitted",
    applicationReceived: "Application Received Successfully",
    applicationReceivedDescription: "We've received your loan application and our AI is already analyzing your profile. You'll receive updates on your application status within 24 hours.",
    nextSteps: "What happens next?",
    nextStep1: "AI assessment of your business profile (24-48 hours)",
    nextStep2: "Document verification and compliance checks",
    nextStep3: "Funding decision and terms finalization",
    backToHome: "Back to Home",
    viewDashboard: "View Dashboard",
    
    // Form Fields
    contactPerson: "Contact Person",
    email: "Email Address",
    phoneNumber: "Phone Number",
    establishedYear: "Established Year",
    employeeCount: "Number of Employees",
    tradeLicense: "Trade License Number",
    requestedAmount: "Requested Amount",
    currency: "Currency",
    purpose: "Purpose of Loan",
    repaymentTerm: "Repayment Term (months)",
    collateral: "Collateral (if any)",
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    submit: "Submit Application",
    submitting: "Submitting...",
    
    // Document Upload
    uploadDocuments: "Upload Documents",
    uploadDescription: "Upload the required documents to complete your application",
    tradeLicenseDoc: "Trade License",
    bankStatements: "Bank Statements (6 months)",
    financialStatements: "Financial Statements",
    businessPlan: "Business Plan",
    uploadFile: "Upload File",
    dragAndDrop: "Drag and drop files here, or click to select",
    supportedFormats: "Supported formats: PDF, JPG, PNG (max 10MB)",
    uploaded: "Uploaded",
    pending: "Pending",
    verified: "Verified",
    rejected: "Rejected",
    
    // Community Lending
    communityLendingPageDescription: "Connect with investors and lenders who understand your business. Access flexible funding through our peer-to-peer lending network.",
    activeLenders: "Active Lenders",
    repaymentRate: "Repayment Rate",
    averageReturn: "Average Return",
    fundingOpportunities: "Funding Opportunities",
    createLoanRequest: "Create Loan Request",
    noLoansAvailable: "No Funding Opportunities Available",
    noLoansDescription: "Be the first to create a funding request and connect with our community of lenders.",
    createFirstLoan: "Create First Loan Request",
    amount: "Amount",
    interestRate: "Interest Rate",
    term: "Term",
    months: "months",
    low: "Low",
    fundingProgress: "Funding Progress",
    reviews: "reviews",
    invest: "Invest",
    howCommunityLendingWorks: "How Community Lending Works",
    browseFundingRequests: "Browse Funding Requests",
    browseFundingRequestsDesc: "Explore vetted business funding opportunities across various industries and risk levels.",
    investSecurely: "Invest Securely",
    investSecurelyDesc: "Make investments with built-in protection and transparent terms through our secure platform.",
    earnReturns: "Earn Returns",
    earnReturnsDesc: "Receive regular payments and track your investment performance through our dashboard.",
    
    // Credit Score
    creditScoreBreakdown: "Credit Score Breakdown",
    creditFactors: "Credit Factors",
    scoreHistory: "Score History",
    lastUpdated: "Last updated",
    improveTips: "Improve Your Score",
    tip1: "Maintain consistent monthly revenue",
    tip2: "Keep business expenses organized",
    tip3: "Build supplier relationships",
    tip4: "Verify all business documents"
  },
  ar: {
    // Header & Navigation  
    trustedBy10k: "موثوق به من قبل أكثر من 10,000 شركة صغيرة ومتوسطة في الإمارات",
    heroTitle1: "احصل على رأس المال العامل",
    heroTitle2: "لشركتك الصغيرة والمتوسطة",
    heroDescription: "احصل على التمويل من خلال التقييم الائتماني المدعوم بالذكاء الاصطناعي وتمويل سلسلة التوريد والإقراض المجتمعي. مصمم خصيصاً لرواد الأعمال في الإمارات.",
    startApplication: "ابدأ التطبيق",
    watchDemo: "شاهد العرض التوضيحي",
    fundingFacilitated: "التمويل المتاح",
    averageApproval: "متوسط الموافقة",
    successRate: "معدل النجاح",
    quickApplication: "تطبيق سريع",
    secure: "آمن",
    businessName: "اسم الشركة",
    enterBusinessName: "أدخل اسم شركتك",
    fundingAmount: "مبلغ التمويل",
    businessType: "نوع النشاط التجاري",
    selectBusinessType: "اختر نوع النشاط التجاري",
    trading: "تجارة",
    manufacturing: "تصنيع",
    services: "خدمات",
    technology: "تكنولوجيا",
    processing: "جاري المعالجة...",
    getPreApproved: "احصل على الموافقة المسبقة",
    secureInfo: "معلوماتك مشفرة وآمنة",
    
    // Trust & Features
    trustedRegulated: "موثوق ومنظم من قبل السلطات الإماراتية",
    featuresTitle1: "كل ما تحتاجه شركتك الصغيرة والمتوسطة",
    featuresTitle2: "للوصول إلى رأس المال",
    featuresDescription: "منصتنا الشاملة تجمع بين التقييم الائتماني المدعوم بالذكاء الاصطناعي وتمويل سلسلة التوريد والإقراض المجتمعي لفتح فرص التمويل.",
    aiCreditScoring: "التقييم الائتماني بالذكاء الاصطناعي",
    aiCreditScoringDesc: "خوارزميات متقدمة تحلل مصادر البيانات البديلة لتقييم الجدارة الائتمانية بما يتجاوز معايير البنوك التقليدية.",
    bankTransactionAnalysis: "تحليل المعاملات المصرفية",
    socialMediaFootprint: "البصمة الرقمية",
    businessPerformanceMetrics: "مقاييس أداء الأعمال",
    supplyChainFinance: "تمويل سلسلة التوريد",
    supplyChainFinanceDesc: "استفد من علاقات الموردين والذمم المدينة للحصول على رأس المال العامل الفوري.",
    invoiceFactoring: "تحويل الفواتير",
    purchaseOrderFinancing: "تمويل أوامر الشراء",
    tradeCreditOptimization: "تحسين الائتمان التجاري",
    communityLending: "الإقراض المجتمعي",
    communityLendingDesc: "تواصل مع شبكة من المستثمرين والمقرضين الذين يفهمون عملك وصناعتك.",
    peerToPeerLending: "الإقراض من النظراء",
    industrySpecificPools: "مجموعات خاصة بالصناعة",
    flexibleTerms: "شروط مرنة",
    mobileFirstPlatform: "منصة محمولة أولاً",
    mobileFirstPlatformDesc: "أكمل الطلبات وتتبع التقدم وإدارة التمويل من أي مكان باستخدام تطبيقنا المحمول.",
    documentScanning: "مسح المستندات",
    realTimeNotifications: "إشعارات فورية",
    offlineCapabilities: "قدرات عدم الاتصال",
    multiCurrencySupport: "دعم متعدد العملات",
    multiCurrencySupportDesc: "تعامل مع المعاملات بالدرهم الإماراتي والدولار الأمريكي والعملات الرئيسية الأخرى مع التحويل التلقائي.",
    realTimeExchangeRates: "أسعار صرف فورية",
    hedgingOptions: "خيارات التحوط",
    multiCurrencyWallets: "محافظ متعددة العملات",
    realTimeDashboard: "لوحة معلومات فورية",
    realTimeDashboardDesc: "راقب خط تمويلك وتتبع الطلبات وحلل مقاييس عملك في مكان واحد.",
    applicationTracking: "تتبع الطلبات",
    cashFlowForecasting: "توقع التدفق النقدي",
    performanceAnalytics: "تحليلات الأداء",
    
    // How It Works
    howItWorksTitle1: "احصل على التمويل في",
    howItWorksTitle2: "4 خطوات بسيطة",
    howItWorksDescription: "عمليتنا المبسطة تأخذك من التطبيق إلى التمويل أسرع من البنوك التقليدية.",
    step1Title: "التقدم عبر الإنترنت",
    step1Description: "أكمل نموذج التطبيق البسيط مع معلومات العمل الأساسية وارفع المستندات المطلوبة.",
    step2Title: "تقييم الذكاء الاصطناعي",
    step2Description: "يحلل ذكاؤنا الاصطناعي بياناتك وينشئ درجة ائتمانية شاملة باستخدام مصادر البيانات البديلة.",
    step3Title: "المطابقة والموافقة",
    step3Description: "احصل على مطابقة مع أفضل خيارات التمويل واستلم قرارات الموافقة خلال 72 ساعة.",
    step4Title: "استلام الأموال",
    step4Description: "احصل على التمويل المعتمد مباشرة إلى حساب عملك وابدأ في تنمية أعمالك.",
    startYourApplication: "ابدأ طلبك",
    averageProcessingTime: "متوسط وقت المعالجة: 72 ساعة",
    
    // CTA
    ctaTitle: "هل أنت مستعد لإطلاق إمكانات عملك؟",
    ctaDescription: "انضم إلى آلاف الشركات الصغيرة والمتوسطة في الإمارات التي حصلت على أكثر من 2.5 مليار درهم إماراتي في التمويل من خلال منصتنا. قصة نموك تبدأ هنا.",
    startApplicationNow: "ابدأ الطلب الآن",
    scheduleDemo: "جدولة عرض توضيحي",
    preApprovedTime: "احصل على الموافقة المسبقة في أقل من 5 دقائق",
    
    // Footer
    footerDescription: "تمكين الشركات الصغيرة والمتوسطة في الإمارات بحلول التمويل المبتكرة. من التقييم الائتماني المدعوم بالذكاء الاصطناعي إلى الإقراض المجتمعي، نحن نُديم الوصول إلى رأس المال العامل.",
    solutions: "الحلول",
    workingCapital: "رأس المال العامل",
    company: "الشركة",
    aboutUs: "من نحن",
    careers: "الوظائف",
    press: "الصحافة",
    contact: "اتصل بنا",
    support: "الدعم",
    helpCenter: "مركز المساعدة",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    compliance: "الامتثال",
    copyright: "© 2024 CapitalFlow. جميع الحقوق محفوظة. مرخص من البنك المركزي الإماراتي.",
    sslSecured: "محمي بـ SSL",
    
    // Navigation
    pricing: "الأسعار",
    resources: "الموارد",
    about: "حول",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ",
    
    // Dashboard
    welcomeBack: "مرحباً بعودتك",
    availableCredit: "الائتمان المتاح",
    activeApplications: "الطلبات النشطة",
    totalFunded: "إجمالي التمويل",
    creditScore: "النقاط الائتمانية",
    pendingReview: "في انتظار المراجعة",
    thisYear: "هذا العام",
    excellent: "ممتاز",
    good: "جيد",
    fair: "مقبول",
    overview: "نظرة عامة",
    applications: "الطلبات",
    documents: "المستندات",
    analytics: "التحليلات",
    recentActivity: "النشاط الأخير",
    loanApplications: "طلبات القروض",
    aiAssessment: "تقييم الذكاء الاصطناعي",
    riskLevel: "مستوى المخاطر",
    businessMetrics: "مقاييس الأعمال",
    monthlyRevenue: "الإيرادات الشهرية",
    employees: "الموظفون",
    businessAge: "عمر الشركة",
    fundingStats: "إحصائيات التمويل",
    approvedApplications: "الطلبات المعتمدة",
    userNotFound: "المستخدم غير موجود",
    userNotFoundDescription: "لا يمكن العثور على المستخدم المطلوب.",
    
    // Application Form
    loanApplication: "طلب قرض",
    applicationDescription: "أكمل طلب التمويل في خطوات بسيطة",
    step: "الخطوة",
    of: "من",
    complete: "مكتمل",
    businessInfo: "معلومات الشركة",
    loanDetails: "تفاصيل القرض",
    review: "مراجعة",
    next: "التالي",
    back: "السابق",
    loanDetailsForm: "نموذج تفاصيل القرض",
    loanDetailsDescription: "حدد متطلبات التمويل وشروط القرض",
    applicationSubmitted: "تم إرسال الطلب",
    applicationReceived: "تم استلام الطلب بنجاح",
    applicationReceivedDescription: "لقد استلمنا طلب القرض الخاص بك وذكاؤنا الاصطناعي يحلل ملفك الشخصي بالفعل. ستتلقى تحديثات حول حالة طلبك خلال 24 ساعة.",
    nextSteps: "ما يحدث بعد ذلك؟",
    nextStep1: "تقييم الذكاء الاصطناعي لملف عملك (24-48 ساعة)",
    nextStep2: "التحقق من المستندات وفحوصات الامتثال",
    nextStep3: "قرار التمويل ووضع اللمسات الأخيرة على الشروط",
    backToHome: "العودة للرئيسية",
    viewDashboard: "عرض لوحة المعلومات",
    
    // Form Fields
    contactPerson: "الشخص المسؤول",
    email: "عنوان البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    establishedYear: "سنة التأسيس",
    employeeCount: "عدد الموظفين",
    tradeLicense: "رقم الرخصة التجارية",
    requestedAmount: "المبلغ المطلوب",
    currency: "العملة",
    purpose: "الغرض من القرض",
    repaymentTerm: "مدة السداد (بالأشهر)",
    collateral: "الضمانات (إن وجدت)",
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
    invalidPhone: "يرجى إدخال رقم هاتف صحيح",
    submit: "إرسال الطلب",
    submitting: "جاري الإرسال...",
    
    // Document Upload
    uploadDocuments: "رفع المستندات",
    uploadDescription: "ارفع المستندات المطلوبة لإكمال طلبك",
    tradeLicenseDoc: "الرخصة التجارية",
    bankStatements: "كشوف حساب البنك (6 أشهر)",
    financialStatements: "البيانات المالية",
    businessPlan: "خطة العمل",
    uploadFile: "رفع ملف",
    dragAndDrop: "اسحب وأفلت الملفات هنا، أو انقر للاختيار",
    supportedFormats: "التنسيقات المدعومة: PDF، JPG، PNG (حد أقصى 10 ميجابايت)",
    uploaded: "تم الرفع",
    pending: "في الانتظار",
    verified: "تم التحقق",
    rejected: "مرفوض",
    
    // Community Lending
    communityLendingPageDescription: "تواصل مع المستثمرين والمقرضين الذين يفهمون عملك. احصل على تمويل مرن من خلال شبكة الإقراض من النظراء.",
    activeLenders: "المقرضون النشطون",
    repaymentRate: "معدل السداد",
    averageReturn: "متوسط العائد",
    fundingOpportunities: "فرص التمويل",
    createLoanRequest: "إنشاء طلب قرض",
    noLoansAvailable: "لا توجد فرص تمويل متاحة",
    noLoansDescription: "كن أول من ينشئ طلب تمويل ويتواصل مع مجتمع المقرضين لدينا.",
    createFirstLoan: "إنشاء أول طلب قرض",
    amount: "المبلغ",
    interestRate: "معدل الفائدة",
    term: "المدة",
    months: "أشهر",
    low: "منخفض",
    fundingProgress: "تقدم التمويل",
    reviews: "مراجعات",
    invest: "استثمر",
    howCommunityLendingWorks: "كيف يعمل الإقراض المجتمعي",
    browseFundingRequests: "تصفح طلبات التمويل",
    browseFundingRequestsDesc: "استكشف فرص تمويل الأعمال المفحوصة عبر مختلف الصناعات ومستويات المخاطر.",
    investSecurely: "استثمر بأمان",
    investSecurelyDesc: "قم بالاستثمارات مع الحماية المدمجة والشروط الشفافة من خلال منصتنا الآمنة.",
    earnReturns: "احصل على عوائد",
    earnReturnsDesc: "استلم مدفوعات منتظمة وتتبع أداء استثمارك من خلال لوحة المعلومات.",
    
    // Credit Score
    creditScoreBreakdown: "تفصيل النقاط الائتمانية",
    creditFactors: "العوامل الائتمانية",
    scoreHistory: "تاريخ النقاط",
    lastUpdated: "آخر تحديث",
    improveTips: "نصائح لتحسين نقاطك",
    tip1: "حافظ على إيرادات شهرية ثابتة",
    tip2: "احتفظ بمصاريف الأعمال منظمة",
    tip3: "بناء علاقات مع الموردين",
    tip4: "تحقق من جميع مستندات الأعمال"
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Update document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
