
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Star,
  Calendar
} from "lucide-react";

interface FinancialData {
  company_name?: string;
  period?: string;
  revenue?: string;
  ebitda?: string;
  growth_percentage?: string;
  key_highlights?: string[];
}

interface FinancialDataDisplayProps {
  data: FinancialData;
  className?: string;
}

const FinancialDataDisplay = ({ data, className = "" }: FinancialDataDisplayProps) => {
  const parsePercentage = (value: string) => {
    const match = value?.match(/([-+]?\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  const growthPercentage = data.growth_percentage ? parsePercentage(data.growth_percentage) : null;
  const isPositiveGrowth = growthPercentage !== null && growthPercentage > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Finansiell översikt
        </CardTitle>
        {data.company_name && (
          <p className="text-lg font-semibold text-blue-600">{data.company_name}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Period */}
        {data.period && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium">Rapportperiod:</span>
            <Badge variant="outline">{data.period}</Badge>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue */}
          {data.revenue && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Intäkter</span>
              </div>
              <p className="text-lg font-bold text-green-900">{data.revenue}</p>
            </div>
          )}

          {/* EBITDA */}
          {data.ebitda && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">EBITDA</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{data.ebitda}</p>
            </div>
          )}

          {/* Growth */}
          {data.growth_percentage && (
            <div className={`p-4 rounded-lg ${isPositiveGrowth ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isPositiveGrowth ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isPositiveGrowth ? 'text-green-800' : 'text-red-800'}`}>
                  Tillväxt
                </span>
              </div>
              <p className={`text-lg font-bold ${isPositiveGrowth ? 'text-green-900' : 'text-red-900'}`}>
                {data.growth_percentage}
              </p>
            </div>
          )}
        </div>

        {/* Key Highlights */}
        {data.key_highlights && data.key_highlights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Viktiga höjdpunkter</span>
            </div>
            <div className="space-y-2">
              {data.key_highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialDataDisplay;
