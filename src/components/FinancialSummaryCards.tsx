
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react';

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
    if (!value) return 'N/A';
    const currency = financialData.currency || 'SEK';
    return `${value} ${currency}`;
  };

  const getGrowthIndicator = (growth: string | undefined) => {
    if (!growth) return null;
    const isPositive = growth.includes('+') || (!growth.includes('-') && parseFloat(growth) > 0);
    return isPositive ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Extraherade Nyckeltal</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Card */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Omsättning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatCurrency(financialData.revenue)}</div>
                {financialData.growth_percentage && (
                  <div className="flex items-center gap-1">
                    {getGrowthIndicator(financialData.growth_percentage)}
                    <span className="text-sm text-gray-600">{financialData.growth_percentage} tillväxt</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* EBITDA Card */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-green-600" />
                EBITDA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatCurrency(financialData.ebitda)}</div>
                <div className="text-sm text-gray-600">Rörelsemarginal</div>
              </div>
            </CardContent>
          </Card>

          {/* Report Info Card */}
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rapportinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-semibold">{financialData.company_name || 'N/A'}</div>
                <Badge variant="outline">{financialData.report_type || 'Q4'} {financialData.period || '2024'}</Badge>
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
            <ul className="space-y-2">
              {financialData.key_highlights?.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </li>
              )) || <li className="text-sm text-gray-500">Inga highlights tillgängliga</li>}
            </ul>
          </CardContent>
        </Card>

        {/* Concerns */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              Områden att Adressera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {financialData.concerns?.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{concern}</span>
                </li>
              )) || <li className="text-sm text-gray-500">Inga concerns identifierade</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CEO Quote */}
      {financialData.ceo_quote && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">VD-kommentar</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-gray-700 border-l-4 border-gray-300 pl-4">
              "{financialData.ceo_quote}"
            </blockquote>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialSummaryCards;
