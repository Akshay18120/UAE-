import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NavHeader from "@/components/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  Building,
  MapPin,
  Target,
  ArrowRight
} from "lucide-react";

export default function Community() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: communityLoans = [], isLoading } = useQuery({
    queryKey: ['/api/community-loans'],
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <NavHeader />
      
      {/* Header */}
      <div className="gradient-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {t('communityLending')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t('communityLendingPageDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-uae-blue mx-auto mb-2" />
              <div className="text-2xl font-bold">2,500+</div>
              <p className="text-sm text-gray-600">{t('activeLenders')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-uae-green mx-auto mb-2" />
              <div className="text-2xl font-bold">AED 45M</div>
              <p className="text-sm text-gray-600">{t('totalFunded')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-sm text-gray-600">{t('repaymentRate')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">5-15%</div>
              <p className="text-sm text-gray-600">{t('averageReturn')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Funding Opportunities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('fundingOpportunities')}</h2>
            <Button className="bg-uae-blue hover:bg-blue-700">
              {t('createLoanRequest')}
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {communityLoans.length === 0 ? (
              <Card className="lg:col-span-2">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('noLoansAvailable')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('noLoansDescription')}
                  </p>
                  <Button className="bg-uae-blue hover:bg-blue-700">
                    {t('createFirstLoan')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              communityLoans.map((loan: any) => (
                <Card key={loan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-uae-blue text-white">
                            {loan.borrower?.businessName?.charAt(0) || 'B'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {loan.borrower?.businessName || 'Business Loan Request'}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-600 space-x-2">
                            <Building className="w-4 h-4" />
                            <span>{loan.borrower?.businessType || 'Technology'}</span>
                            <MapPin className="w-4 h-4 ml-2" />
                            <span>Dubai, UAE</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {loan.status || 'Open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        {loan.description || 'Seeking working capital to expand operations and increase inventory levels.'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">{t('amount')}:</span>
                          <div className="font-semibold">AED {parseFloat(loan.amount || 250000).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('interestRate')}:</span>
                          <div className="font-semibold">{parseFloat(loan.interestRate || 12).toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('term')}:</span>
                          <div className="font-semibold">{loan.term || 24} {t('months')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('riskLevel')}:</span>
                          <div className="font-semibold text-green-600">{t('low')}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t('fundingProgress')}</span>
                          <span>
                            AED {parseFloat(loan.fundedAmount || 0).toLocaleString()} / 
                            AED {parseFloat(loan.fundingTarget || loan.amount || 250000).toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(parseFloat(loan.fundedAmount || 0) / parseFloat(loan.fundingTarget || loan.amount || 250000)) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">4.8</span>
                          <span className="text-sm text-gray-600">({15} {t('reviews')})</span>
                        </div>
                        <Button size="sm" className="bg-uae-blue hover:bg-blue-700">
                          {t('invest')} <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              {t('howCommunityLendingWorks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-uae-blue font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">{t('browseFundingRequests')}</h3>
                <p className="text-sm text-gray-600">
                  {t('browseFundingRequestsDesc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-uae-green font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">{t('investSecurely')}</h3>
                <p className="text-sm text-gray-600">
                  {t('investSecurelyDesc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-500 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">{t('earnReturns')}</h3>
                <p className="text-sm text-gray-600">
                  {t('earnReturnsDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
