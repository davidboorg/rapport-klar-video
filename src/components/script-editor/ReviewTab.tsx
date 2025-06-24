
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import FinancialDataDisplay from "../FinancialDataDisplay";
import ScriptAlternativesDisplay from "../ScriptAlternativesDisplay";

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

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

interface ReviewTabProps {
  financialData: FinancialData | null;
  scriptAlternatives: ScriptAlternative[];
  onScriptSelect: (selectedScript: ScriptAlternative) => void;
}

const ReviewTab = ({ financialData, scriptAlternatives, onScriptSelect }: ReviewTabProps) => {
  if (!financialData && scriptAlternatives.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="font-medium mb-2">No data available</h3>
          <p className="text-sm text-gray-600">
            Upload a document to get AI-generated analysis and scripts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {financialData && (
        <FinancialDataDisplay data={financialData} />
      )}
      
      {scriptAlternatives.length > 0 && (
        <ScriptAlternativesDisplay 
          alternatives={scriptAlternatives}
          onScriptSelect={onScriptSelect}
        />
      )}
    </div>
  );
};

export default ReviewTab;
