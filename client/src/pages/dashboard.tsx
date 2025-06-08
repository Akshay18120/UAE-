import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavHeader from "@/components/nav-header";
import FundingDashboard from "@/components/funding-dashboard";
import CreditScoreDisplay from "@/components/credit-score-display";
import { useLanguage } from "@/hooks/use-language";
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle,
  Upload,
  AlertCircle,
  BarChart3,
  CreditCard,
  Building
} from "lucide-react";

export default function Dashboard() {
  const { userId } = useParams();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/dashboard`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
        <NavHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-uae-blue"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
        <NavHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">{t('userNotFound')}</h1>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {t('userNotFoundDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, metrics, recentApplications, recentDocuments, recentTransactions, creditAssessment } = dashboardData;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <NavHeader />
      
      {/* Dashboard Header */}
      <div className="gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('welcomeBack')}, {user.contactPerson}!</h1>
              <p className="text-blue-100 text-lg">{user.businessName}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">AED {metrics.availableCredit.toLocaleString()}</div>
              <p className="text-blue-100">{t('availableCredit')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('activeApplications')}</h3>
                <FileText className="text-uae-blue w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-uae-blue mb-2">{metrics.activeApplications}</div>
              <p className="text-sm text-gray-600">{recentApplications.filter(app => app.status === 'pending').length} {t('pendingReview')}</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('totalFunded')}</h3>
                <DollarSign className="text-uae-green w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-uae-green mb-2">
                AED {metrics.totalFunded.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">{t('thisYear')}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('creditScore')}</h3>
                <BarChart3 className="text-purple-500 w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-purple-500 mb-2">{metrics.creditScore}</div>
              <p className="text-sm text-gray-600">
                {metrics.creditScore >= 750 ? t('excellent') : metrics.creditScore >= 650 ? t('good') : t('fair')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="applications">{t('applications')}</TabsTrigger>
            <TabsTrigger value="documents">{t('documents')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('recentActivity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="text-blue-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {application.loanType.replace('_', ' ')} - AED {parseFloat(application.requestedAmount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant={application.status === 'approved' ? 'default' : 'secondary'}>
                            {application.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {recentTransactions.slice(0, 2).map((transaction) => (
                    <div key={transaction.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {transaction.transactionType} - AED {parseFloat(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Credit Score Display */}
              <CreditScoreDisplay 
                creditAssessment={creditAssessment} 
                creditScore={metrics.creditScore}
              />
            </div>

            {/* Funding Dashboard */}
            <FundingDashboard 
              applications={recentApplications}
              transactions={recentTransactions}
              metrics={metrics}
            />
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>{t('loanApplications')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{application.applicationNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {application.loanType.replace('_', ' ')} • AED {parseFloat(application.requestedAmount).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          application.status === 'approved' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{application.purpose}</p>
                      {application.aiAssessment && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm">
                            <strong>{t('aiAssessment')}:</strong> {application.aiAssessment.confidence} confidence
                          </p>
                          <p className="text-sm">
                            <strong>{t('riskLevel')}:</strong> {application.aiAssessment.riskLevel}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {t('documents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{document.fileName}</p>
                          <p className="text-sm text-gray-600">{document.documentType}</p>
                        </div>
                      </div>
                      <Badge variant={
                        document.status === 'verified' ? 'default' : 
                        document.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {document.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('businessMetrics')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('monthlyRevenue')}</span>
                      <span>AED {parseFloat(user.monthlyRevenue || "0").toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min((parseFloat(user.monthlyRevenue || "0") / 500000) * 100, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('employees')}</span>
                      <span>{user.employeeCount || 0}</span>
                    </div>
                    <Progress value={Math.min((user.employeeCount || 0) / 100 * 100, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('businessAge')}</span>
                      <span>{new Date().getFullYear() - (user.establishedYear || new Date().getFullYear())} years</span>
                    </div>
                    <Progress value={Math.min(((new Date().getFullYear() - (user.establishedYear || new Date().getFullYear())) / 20) * 100, 100)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('fundingStats')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-uae-blue mx-auto mb-2" />
                    <p className="text-2xl font-bold text-uae-blue">
                      {recentApplications.filter(app => app.status === 'approved').length}
                    </p>
                    <p className="text-sm text-gray-600">{t('approvedApplications')}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-uae-green mx-auto mb-2" />
                    <p className="text-2xl font-bold text-uae-green">
                      AED {metrics.totalFunded.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{t('totalFunded')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
