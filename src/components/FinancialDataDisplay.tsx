
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Building2, Calendar } from 'lucide-react';

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

interface FinancialDataDisplayProps {
  data: FinancialData;
}

const FinancialDataDisplay: React.FC<FinancialDataDisplayProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Company</label>
              <p className="font-medium">{data.company_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Period</label>
              <p className="font-medium">{data.period || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Report Type</label>
              <p className="font-medium">{data.report_type || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Currency</label>
              <p className="font-medium">{data.currency || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">{data.revenue || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">EBITDA</p>
                <p className="text-2xl font-bold">{data.ebitda || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Growth</p>
                <p className="text-2xl font-bold">{data.growth_percentage || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlights & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.key_highlights && data.key_highlights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.key_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +
                    </Badge>
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {data.concerns && data.concerns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      !
                    </Badge>
                    <span className="text-sm">{concern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CEO Quote */}
      {data.ceo_quote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CEO Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-gray-700 border-l-4 border-blue-200 pl-4">
              "{data.ceo_quote}"
            </blockquote>
          </CardContent>
        </Card>
      )}

      {/* Forward Guidance */}
      {data.forward_guidance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forward Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{data.forward_guidance}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialDataDisplay;
