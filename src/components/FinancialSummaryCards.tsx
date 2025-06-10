
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Building2, Calendar } from 'lucide-react';

interface FinancialData {
  company_name?: string;
  period?: string;
  revenue?: string;
  ebitda?: string;
  growth_percentage?: string;
  key_highlights?: string[];
  concerns?: string[];
  report_type?: string;
  currency?: string;
  ceo_quote?: string;
  forward_guidance?: string;
}

interface FinancialSummaryCardsProps {
  financialData: FinancialData;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ financialData }) => {
  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'Ej tillgängligt';
    const currency = financialData.currency || 'SEK';
    return `${value} ${currency}`;
  };

  const getGrowthIndicator = (growth: string | undefined) => {
    if (!growth) return null;
    const numericValue = parseFloat(growth.replace(/[^\d.-]/g, ''));
    const isPositive = numericValue >= 0;
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getGrowthColor = (growth: string | undefined) => {
    if (!growth) return 'text-gray-600';
    const numericValue = parseFloat(growth.replace(/[^\d.-]/g, ''));
    return numericValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Company Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          {financialData.company_name || 'Företagsnamn'}
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {financialData.report_type || 'Q4'} {financialData.period || '2024'}
          </Badge>
          <span>{financialData.currency || 'SEK'}</span>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Finansiella Nyckeltal</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-blue-700">
                <DollarSign className="w-4 h-4" />
                Omsättning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(financialData.revenue)}
                </div>
                {financialData.growth_percentage && (
                  <div className="flex items-center gap-1">
                    {getGrowthIndicator(financialData.growth_percentage)}
                    <span className={`text-sm font-medium ${getGrowthColor(financialData.growth_percentage)}`}>
                      {financialData.growth_percentage} tillväxt
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* EBITDA Card */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                <Target className="w-4 h-4" />
                EBITDA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(financialData.ebitda)}
                </div>
                <div className="text-sm text-green-700">Rörelsemarginal</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Highlights and Concerns */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Highlights */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-green-700">
              <TrendingUp className="w-4 h-4" />
              Viktiga Framgångar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialData.key_highlights && financialData.key_highlights.length > 0 ? (
              <ul className="space-y-3">
                {financialData.key_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Inga highlights extraherade från rapporten</p>
            )}
          </CardContent>
        </Card>

        {/* Concerns */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              Områden att Beakta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialData.concerns && financialData.concerns.length > 0 ? (
              <ul className="space-y-3">
                {financialData.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{concern}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Inga concerns identifierade i rapporten</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CEO Quote */}
      {financialData.ceo_quote && (
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-700">VD-kommentar</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-slate-700 border-l-4 border-slate-400 pl-4 leading-relaxed">
              "{financialData.ceo_quote}"
            </blockquote>
          </CardContent>
        </Card>
      )}

      {/* Forward Guidance */}
      {financialData.forward_guidance && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-sm text-purple-700">Framtidsutsikter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700 leading-relaxed">
              {financialData.forward_guidance}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialSummaryCards;
