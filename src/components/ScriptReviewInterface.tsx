
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, CheckCircle } from 'lucide-react';
import FinancialSummaryCards from './FinancialSummaryCards';
import ScriptComparisonView from './ScriptComparisonView';
import InlineScriptEditor from './InlineScriptEditor';

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

interface ScriptReviewInterfaceProps {
  projectId: string;
  financialData: FinancialData;
  scriptAlternatives: ScriptAlternative[];
  onScriptSelect: (script: ScriptAlternative) => void;
  onCustomizeScript: (customizedScript: string) => void;
}

const ScriptReviewInterface: React.FC<ScriptReviewInterfaceProps> = ({
  projectId,
  financialData,
  scriptAlternatives,
  onScriptSelect,
  onCustomizeScript
}) => {
  const [activeTab, setActiveTab] = useState('data');
  const [selectedScript, setSelectedScript] = useState<ScriptAlternative | null>(null);
  const [isReadyForNext, setIsReadyForNext] = useState(false);

  const handleScriptSelect = (script: ScriptAlternative) => {
    setSelectedScript(script);
    onScriptSelect(script);
    setIsReadyForNext(true);
  };

  const handleScriptUpdate = (updatedScript: string) => {
    onCustomizeScript(updatedScript);
  };

  const handleNextStep = () => {
    if (activeTab === 'data') {
      setActiveTab('compare');
    } else if (activeTab === 'compare' && selectedScript) {
      setActiveTab('edit');
    } else if (activeTab === 'edit') {
      // Continue to video generation
      console.log('Ready for video generation');
    }
  };

  const getStepProgress = () => {
    switch (activeTab) {
      case 'data': return 1;
      case 'compare': return 2;
      case 'edit': return 3;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Script-skapande Workflow</h2>
            <div className="text-sm text-gray-600">Steg {getStepProgress()} av 3</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${activeTab === 'data' ? 'text-blue-600' : getStepProgress() > 1 ? 'text-green-600' : 'text-gray-400'}`}>
              {getStepProgress() > 1 ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-full" />}
              <span className="text-sm font-medium">Granska Data</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'compare' ? 'text-blue-600' : getStepProgress() > 2 ? 'text-green-600' : 'text-gray-400'}`}>
              {getStepProgress() > 2 ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-full" />}
              <span className="text-sm font-medium">Välj Script</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${activeTab === 'edit' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="w-4 h-4 border-2 border-current rounded-full" />
              <span className="text-sm font-medium">Anpassa Innehåll</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">Finansiell Data</TabsTrigger>
          <TabsTrigger value="compare" disabled={!financialData}>Jämför Scripts</TabsTrigger>
          <TabsTrigger value="edit" disabled={!selectedScript}>Redigera Script</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-6">
          <FinancialSummaryCards financialData={financialData} />
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          <ScriptComparisonView 
            scriptAlternatives={scriptAlternatives}
            onScriptSelect={handleScriptSelect}
            selectedScript={selectedScript || undefined}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {selectedScript && (
            <InlineScriptEditor
              selectedScript={selectedScript}
              onScriptUpdate={handleScriptUpdate}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (activeTab === 'compare') setActiveTab('data');
                else if (activeTab === 'edit') setActiveTab('compare');
              }}
              disabled={activeTab === 'data'}
            >
              Föregående
            </Button>
            
            <Button 
              onClick={handleNextStep}
              disabled={
                (activeTab === 'compare' && !selectedScript) ||
                (activeTab === 'data' && !financialData)
              }
            >
              {activeTab === 'edit' ? 'Fortsätt till Video' : 'Nästa Steg'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptReviewInterface;
