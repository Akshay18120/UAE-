import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavHeader from "@/components/nav-header";
import ApplicationForm from "@/components/application-form";
import DocumentUpload from "@/components/document-upload";
import { useLanguage } from "@/hooks/use-language";
import { CheckCircle, FileText, Upload, CreditCard, AlertCircle } from "lucide-react";

export default function Application() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = language === 'ar';

  const steps = [
    { id: 1, title: t('businessInfo'), icon: FileText },
    { id: 2, title: t('loanDetails'), icon: CreditCard },
    { id: 3, title: t('documents'), icon: Upload },
    { id: 4, title: t('review'), icon: CheckCircle }
  ];

  const handleApplicationSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Here we would submit to the API
      console.log('Submitting application:', data);
      setApplicationData(data);
      setCurrentStep(4);
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <NavHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('loanApplication')}</h1>
          <p className="text-lg text-gray-600">{t('applicationDescription')}</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('step')} {currentStep} {t('of')} {steps.length}</span>
                <span>{Math.round(progress)}% {t('complete')}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div 
                    key={step.id} 
                    className={`flex flex-col items-center ${
                      isActive ? 'text-uae-blue' : isCompleted ? 'text-uae-green' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Application Steps */}
        {currentStep === 1 && (
          <ApplicationForm 
            onNext={(data) => {
              setApplicationData(data);
              setCurrentStep(2);
            }}
            initialData={applicationData}
          />
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('loanDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('loanDetailsForm')}</h3>
                  <p className="text-gray-600">{t('loanDetailsDescription')}</p>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    {t('back')}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-uae-blue hover:bg-blue-700"
                  >
                    {t('next')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <DocumentUpload 
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-uae-green" />
                {t('applicationSubmitted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-uae-green" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('applicationReceived')}
                  </h3>
                  <p className="text-gray-600">
                    {t('applicationReceivedDescription')}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">{t('nextSteps')}</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t('nextStep1')}</li>
                    <li>• {t('nextStep2')}</li>
                    <li>• {t('nextStep3')}</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/")}
                    className="flex-1"
                  >
                    {t('backToHome')}
                  </Button>
                  <Button 
                    onClick={() => setLocation(`/dashboard/1`)} // Mock user ID
                    className="flex-1 bg-uae-blue hover:bg-blue-700"
                  >
                    {t('viewDashboard')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
