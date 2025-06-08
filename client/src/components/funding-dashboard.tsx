import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  ArrowUpRight,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard
} from "lucide-react";

interface LoanApplication {
  id: number;
  applicationNumber: string;
  loanType: string;
  requestedAmount: string;
  currency: string;
  status: string;
  purpose: string;
  createdAt: Date;
  interestRate?: string;
  aiAssessment?: any;
}

interface FundingTransaction {
  id: number;
  applicationId: number;
  userId: number;
  transactionType: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: Date;
}

interface Metrics {
  activeApplications: number;
  totalFunded: number;
  creditScore: number;
  availableCredit: number;
}

interface FundingDashboardProps {
  applications: LoanApplication[];
  transactions: FundingTransaction[];
  metrics: Metrics;
}

export default function FundingDashboard({ applications, transactions, metrics }: FundingDashboardProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'reviewing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-700">Reviewing</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'funded':
        return <Badge className="bg-green-100 text-green-700">Funded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approvedApplications = applications.filter(app => app.status === 'approved');
  const pendingApplications = applications.filter(app => ['pending', 'reviewing'].includes(app.status));
  const recentTransactions = transactions.slice(0, 5);

  // Calculate funding pipeline value
  const pipelineValue = applications
    .filter(app => ['approved', 'reviewing'].includes(app.status))
    .reduce((sum, app) => sum + parseFloat(app.requestedAmount), 0);

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : ''}`}>
      {/* Pipeline Overview */}
      <div className="grid lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeApplications')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeApplications}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-uae-blue" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(metrics.activeApplications / 10) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pipelineValue, 'AED', language)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-uae-green" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalFunded')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalFunded, 'AED', language)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-uae-green" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">{approvedApplications.length} approved loans</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('availableCredit')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.availableCredit, 'AED', language)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">Based on credit score: {metrics.creditScore}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('applications')} Pipeline</span>
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 4).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {application.applicationNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.loanType.replace('_', ' ')} • 
                        {formatCurrency(parseFloat(application.requestedAmount), application.currency, language)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(application.createdAt, language)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(application.status)}
                    {application.interestRate && (
                      <p className="text-sm text-gray-600 mt-1">
                        {parseFloat(application.interestRate).toFixed(1)}% APR
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                  <Button className="mt-4 bg-uae-blue hover:bg-blue-700">
                    Create Application
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.transactionType === 'disbursement' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {transaction.transactionType === 'disbursement' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {transaction.transactionType}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt, language)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transactionType === 'disbursement' 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>
                      {transaction.transactionType === 'disbursement' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount), transaction.currency, language)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button className="bg-uae-blue hover:bg-blue-700 h-auto p-4 flex-col items-start">
              <FileText className="w-6 h-6 mb-2" />
              <span className="font-medium">New Application</span>
              <span className="text-sm opacity-80">Apply for funding</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <Target className="w-6 h-6 mb-2" />
              <span className="font-medium">Track Application</span>
              <span className="text-sm text-gray-600">Check status</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="font-medium">View Analytics</span>
              <span className="text-sm text-gray-600">Business insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
