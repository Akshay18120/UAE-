import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { formatDate } from "@/lib/i18n";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface CreditAssessment {
  id: number;
  userId: number;
  assessmentType: string;
  score: number;
  factors: any;
  recommendations: any[];
  validUntil: Date | null;
  createdAt: Date;
}

interface CreditScoreDisplayProps {
  creditAssessment: CreditAssessment | null;
  creditScore: number;
}

export default function CreditScoreDisplay({ creditAssessment, creditScore }: CreditScoreDisplayProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600";
    if (score >= 650) return "text-blue-600";
    if (score >= 550) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 750) return "bg-green-50 border-green-200";
    if (score >= 650) return "bg-blue-50 border-blue-200";
    if (score >= 550) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 750) return t('excellent');
    if (score >= 650) return t('good');
    if (score >= 550) return t('fair');
    return 'Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 650) return <TrendingUp className="w-5 h-5 text-green-600" />;
    return <TrendingDown className="w-5 h-5 text-yellow-600" />;
  };

  // Mock score history for demonstration
  const scoreHistory = [
    { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), score: creditScore - 25 },
    { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), score: creditScore - 15 },
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: creditScore - 5 },
    { date: new Date(), score: creditScore },
  ];

  const factorData = creditAssessment?.factors || {
    businessAge: { score: 80, weight: 0.2 },
    revenue: { score: 75, weight: 0.3 },
    employeeCount: { score: 60, weight: 0.2 },
    businessType: { score: 70, weight: 0.15 },
    verification: { score: 90, weight: 0.15 }
  };

  const improvementTips = [
    { icon: <TrendingUp className="w-4 h-4" />, tip: t('tip1') },
    { icon: <BarChart3 className="w-4 h-4" />, tip: t('tip2') },
    { icon: <CheckCircle className="w-4 h-4" />, tip: t('tip3') },
    { icon: <AlertCircle className="w-4 h-4" />, tip: t('tip4') }
  ];

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : ''}`}>
      <Card className={getScoreBackground(creditScore)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            {t('creditScore')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={`text-6xl font-bold ${getScoreColor(creditScore)}`}>
                {creditScore}
              </div>
              <Badge 
                variant="outline" 
                className={`mt-2 ${getScoreColor(creditScore)} border-current`}
              >
                {getScoreLabel(creditScore)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              {getScoreIcon(creditScore)}
              <span>
                {t('lastUpdated')}: {creditAssessment ? formatDate(creditAssessment.createdAt, language) : 'N/A'}
              </span>
            </div>

            {/* Score Range Visual */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>300</span>
                <span>850</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500"
                  style={{ width: '100%' }}
                />
                <div 
                  className="absolute top-0 w-2 h-full bg-white border border-gray-400 rounded-sm"
                  style={{ left: `${((creditScore - 300) / 550) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Poor</span>
                <span className="text-yellow-600">{t('fair')}</span>
                <span className="text-blue-600">{t('good')}</span>
                <span className="text-green-600">{t('excellent')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Factors Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('creditFactors')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(factorData).map(([factor, data]: [string, any]) => (
            <div key={factor} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">
                  {factor.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={getScoreColor(data.score)}>
                  {data.score}/100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={data.score} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-gray-500 w-12">
                  {Math.round(data.weight * 100)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('scoreHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoreHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatDate(entry.date, language)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getScoreColor(entry.score)}`}>
                    {entry.score}
                  </span>
                  {index > 0 && (
                    <div className="flex items-center gap-1">
                      {entry.score > scoreHistory[index - 1].score ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : entry.score < scoreHistory[index - 1].score ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span className="text-xs text-gray-500">
                        {entry.score > scoreHistory[index - 1].score ? '+' : ''}
                        {entry.score - scoreHistory[index - 1].score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t('improveTips')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-uae-blue mt-0.5">
                  {tip.icon}
                </div>
                <span className="text-sm text-gray-700">{tip.tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
