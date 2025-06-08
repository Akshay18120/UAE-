import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NavHeader from "@/components/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { 
  Star, 
  CheckCircle, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Brain, 
  Link, 
  Smartphone, 
  Globe, 
  BarChart3,
  Play,
  Rocket,
  Building,
  University,
  IdCard,
  ShieldCheck,
  ChartLine,
  DollarSign,
  FileText,
  Upload,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [applicationForm, setApplicationForm] = useState({
    businessName: "",
    fundingAmount: "",
    businessType: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationForm.businessName || !applicationForm.fundingAmount || !applicationForm.businessType) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLocation("/application");
    }, 1500);
  };

  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <NavHeader />
      
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-black/20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  {t('trustedBy10k')}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {t('heroTitle1')}
                  <span className="text-uae-gold"> {t('heroTitle2')}</span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  {t('heroDescription')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-uae-blue hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => setLocation("/application")}
                >
                  <Rocket className="w-5 h-5" />
                  {t('startApplication')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {t('watchDemo')}
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">AED 2.5B+</div>
                  <div className="text-blue-200 text-sm">{t('fundingFacilitated')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">72hrs</div>
                  <div className="text-blue-200 text-sm">{t('averageApproval')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-blue-200 text-sm">{t('successRate')}</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glassmorphism rounded-2xl p-8 animate-float">
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{t('quickApplication')}</h3>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <Shield className="w-3 h-3 mr-1" />
                        {t('secure')}
                      </Badge>
                    </div>
                    
                    <form onSubmit={handleQuickApplication} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('businessName')}
                        </label>
                        <Input
                          value={applicationForm.businessName}
                          onChange={(e) => setApplicationForm({...applicationForm, businessName: e.target.value})}
                          placeholder={t('enterBusinessName')}
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('fundingAmount')} (AED)
                        </label>
                        <Input
                          value={applicationForm.fundingAmount}
                          onChange={(e) => setApplicationForm({...applicationForm, fundingAmount: e.target.value})}
                          placeholder="50,000 - 5,000,000"
                          className="focus:ring-uae-blue focus:border-uae-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('businessType')}
                        </label>
                        <Select value={applicationForm.businessType} onValueChange={(value) => setApplicationForm({...applicationForm, businessType: value})}>
                          <SelectTrigger className="focus:ring-uae-blue focus:border-uae-blue">
                            <SelectValue placeholder={t('selectBusinessType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trading">{t('trading')}</SelectItem>
                            <SelectItem value="manufacturing">{t('manufacturing')}</SelectItem>
                            <SelectItem value="services">{t('services')}</SelectItem>
                            <SelectItem value="technology">{t('technology')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-uae-blue hover:bg-blue-700" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('processing') : t('getPreApproved')}
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />
                      {t('secureInfo')}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-8">{t('trustedRegulated')}</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <University className="text-2xl text-uae-blue" />
                <span className="font-semibold">UAE Central Bank</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="text-2xl text-uae-blue" />
                <span className="font-semibold">ADGM</span>
              </div>
              <div className="flex items-center space-x-2">
                <IdCard className="text-2xl text-uae-blue" />
                <span className="font-semibold">DFSA Licensed</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-2xl text-uae-green" />
                <span className="font-semibold">ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('featuresTitle1')}
              <span className="text-uae-blue"> {t('featuresTitle2')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('featuresDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="text-uae-blue text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('aiCreditScoring')}</h3>
                <p className="text-gray-600 mb-6">{t('aiCreditScoringDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('bankTransactionAnalysis')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('socialMediaFootprint')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('businessPerformanceMetrics')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Link className="text-uae-green text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('supplyChainFinance')}</h3>
                <p className="text-gray-600 mb-6">{t('supplyChainFinanceDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('invoiceFactoring')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('purchaseOrderFinancing')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('tradeCreditOptimization')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="text-uae-red text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('communityLending')}</h3>
                <p className="text-gray-600 mb-6">{t('communityLendingDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('peerToPeerLending')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('industrySpecificPools')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('flexibleTerms')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="text-purple-500 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('mobileFirstPlatform')}</h3>
                <p className="text-gray-600 mb-6">{t('mobileFirstPlatformDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('documentScanning')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('realTimeNotifications')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('offlineCapabilities')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="text-orange-500 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('multiCurrencySupport')}</h3>
                <p className="text-gray-600 mb-6">{t('multiCurrencySupportDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('realTimeExchangeRates')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('hedgingOptions')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('multiCurrencyWallets')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-teal-500 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('realTimeDashboard')}</h3>
                <p className="text-gray-600 mb-6">{t('realTimeDashboardDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('applicationTracking')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('cashFlowForecasting')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-uae-green mr-2 w-4 h-4" />
                    {t('performanceAnalytics')}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('howItWorksTitle1')}
              <span className="text-uae-blue"> {t('howItWorksTitle2')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('howItWorksDescription')}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-uae-blue to-uae-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('step1Title')}</h3>
              <p className="text-gray-600">{t('step1Description')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-uae-green to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('step2Title')}</h3>
              <p className="text-gray-600">{t('step2Description')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('step3Title')}</h3>
              <p className="text-gray-600">{t('step3Description')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-uae-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('step4Title')}</h3>
              <p className="text-gray-600">{t('step4Description')}</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-uae-blue hover:bg-blue-700"
              onClick={() => setLocation("/application")}
            >
              {t('startYourApplication')}
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              <Clock className="w-4 h-4 inline mr-1" />
              {t('averageProcessingTime')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-uae-blue hover:bg-gray-100"
              onClick={() => setLocation("/application")}
            >
              {t('startApplicationNow')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
            >
              {t('scheduleDemo')}
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-6 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            {t('preApprovedTime')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-uae-blue to-uae-green rounded-lg flex items-center justify-center">
                  <ChartLine className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">CapitalFlow</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t('footerDescription')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('solutions')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('workingCapital')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('supplyChainFinance')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('communityLending')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('invoiceFactoring')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('company')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('aboutUs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('careers')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('press')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('contact')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('support')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('termsOfService')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('compliance')}</a></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('copyright')}
            </p>
            <div className="flex items-center space-x-6 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="text-uae-blue w-4 h-4" />
                <span>{t('sslSecured')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <IdCard className="text-uae-green w-4 h-4" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
