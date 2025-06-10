
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  FileText, 
  Film,
  RefreshCw
} from "lucide-react";
import ScriptReviewInterface from "./ScriptReviewInterface";
import ScriptManualEditor from "./ScriptManualEditor";
import VideoGeneration from "./VideoGeneration";

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

interface ScriptEditorTabsProps {
  projectId: string;
  script: string;
  setScript: (script: string) => void;
  isSaving: boolean;
  isProcessing: boolean;
  financialData: FinancialData | null;
  scriptAlternatives: ScriptAlternative[];
  existingVideoUrl: string | null;
  dataLoadingState: 'loading' | 'loaded' | 'error';
  onSave: () => void;
  onPreview: () => void;
  onScriptSelect: (script: ScriptAlternative) => void;
  onCustomizeScript: (script: string) => void;
  onStartProcessing: () => void;
  onRefreshData: () => void;
}

const ScriptEditorTabs = ({
  projectId,
  script,
  setScript,
  isSaving,
  isProcessing,
  financialData,
  scriptAlternatives,
  existingVideoUrl,
  dataLoadingState,
  onSave,
  onPreview,
  onScriptSelect,
  onCustomizeScript,
  onStartProcessing,
  onRefreshData
}: ScriptEditorTabsProps) => {
  return (
    <Tabs defaultValue="review" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="review" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Granska & Välj
        </TabsTrigger>
        <TabsTrigger value="script" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Redigera Manus
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center gap-2">
          <Film className="w-4 h-4" />
          Generera Video
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="review">
        {financialData && scriptAlternatives.length > 0 ? (
          <ScriptReviewInterface
            projectId={projectId}
            financialData={financialData}
            scriptAlternatives={scriptAlternatives}
            onScriptSelect={onScriptSelect}
            onCustomizeScript={onCustomizeScript}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-2">
                {dataLoadingState === 'error' ? 'Fel vid laddning av data' : 'Ingen bearbetad data tillgänglig'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {dataLoadingState === 'error' 
                  ? 'Det uppstod ett problem vid laddning av projektdata.'
                  : 'Starta bearbetningen för att få AI-genererade manuscriptförslag.'
                }
              </p>
              <div className="space-y-2">
                <Button onClick={onStartProcessing}>
                  <Brain className="w-4 h-4 mr-2" />
                  Starta AI-bearbetning
                </Button>
                {dataLoadingState === 'error' && (
                  <Button variant="outline" onClick={onRefreshData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Försök igen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="script">
        <ScriptManualEditor
          script={script}
          setScript={setScript}
          isSaving={isSaving}
          isProcessing={isProcessing}
          onSave={onSave}
          onPreview={onPreview}
          onRegenerateScript={onStartProcessing}
        />
      </TabsContent>

      <TabsContent value="video">
        <VideoGeneration
          projectId={projectId}
          scriptText={script}
          financialData={financialData}
          existingVideoUrl={existingVideoUrl}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ScriptEditorTabs;
