
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VideoGeneration from "./VideoGeneration";
import ScriptReviewInterface from "./ScriptReviewInterface";
import ProcessingWorkflow from "./ProcessingWorkflow";
import { useScriptEditorActions } from "./ScriptEditorHelpers";
import { 
  Save, 
  Play, 
  Clock, 
  FileText, 
  Wand2,
  RefreshCw,
  Film,
  Brain,
  CheckCircle
} from "lucide-react";

interface ScriptEditorProps {
  projectId: string;
  initialScript?: string;
  onScriptUpdate?: (script: string) => void;
}

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

const ScriptEditor = ({ projectId, initialScript = "", onScriptUpdate }: ScriptEditorProps) => {
  const [script, setScript] = useState(initialScript);
  const [isSaving, setSaving] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [scriptAlternatives, setScriptAlternatives] = useState<ScriptAlternative[]>([]);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const [showProcessingWorkflow, setShowProcessingWorkflow] = useState(false);
  const [projectStatus, setProjectStatus] = useState<string>('');
  const [dataLoadingState, setDataLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const { toast } = useToast();

  const {
    handleSave: saveScript,
    handleScriptSelect,
    handleCustomizeScript,
    handlePreview,
    handleProcessingComplete: processComplete
  } = useScriptEditorActions(projectId, script, setScript, onScriptUpdate);

  // Calculate estimated video duration (150 words per minute speaking rate)
  const estimatedDuration = Math.ceil(script.split(' ').filter(word => word.length > 0).length / 150);

  const handleSave = () => saveScript(setSaving);
  const handleProcessingComplete = (result: { success: boolean; data?: any; error?: string }) => 
    processComplete(result, fetchProjectData, setProcessing, setShowProcessingWorkflow);

  useEffect(() => {
    console.log('ScriptEditor: Initializing for project:', projectId);
    fetchProjectData();
    
    // Set up real-time subscription to monitor project changes
    const subscription = supabase
      .channel('project_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        () => {
          console.log('Project updated, refreshing data...');
          fetchProjectData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    console.log('ScriptEditor: Starting fetchProjectData for project:', projectId);
    setDataLoadingState('loading');
    
    try {
      // Fetch project data including status
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data, status, pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project data:', projectError);
        throw projectError;
      }
      
      console.log('ScriptEditor: Project data fetched:', {
        status: projectData.status,
        hasFinancialData: !!projectData?.financial_data,
        financialDataKeys: projectData?.financial_data ? Object.keys(projectData.financial_data) : [],
        hasPdfUrl: !!projectData?.pdf_url
      });

      setProjectStatus(projectData.status);

      // Check if we have valid financial data
      let hasValidFinancialData = false;
      if (projectData?.financial_data) {
        const financialDataObj = projectData.financial_data as FinancialData;
        console.log('ScriptEditor: Financial data content:', financialDataObj);
        
        // Check if any of the key financial fields have real data (not "Information saknas")
        const hasRealData = Object.values(financialDataObj).some(value => {
          if (typeof value === 'string') {
            return value !== 'Information saknas' && value.trim() !== '';
          }
          if (Array.isArray(value)) {
            return value.length > 0 && !value.every(item => item === 'Information saknas');
          }
          return value !== null && value !== undefined;
        });

        if (hasRealData) {
          setFinancialData(financialDataObj);
          hasValidFinancialData = true;
          console.log('ScriptEditor: Valid financial data found and set');
        } else {
          console.log('ScriptEditor: Financial data exists but contains only placeholder values');
        }
      }

      // Fetch existing script alternatives and video
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_text, script_alternatives, video_url')
        .eq('project_id', projectId)
        .maybeSingle();

      let hasValidScriptAlternatives = false;
      
      if (!contentError && contentData) {
        console.log('ScriptEditor: Content data fetched:', {
          hasScriptAlternatives: !!contentData.script_alternatives,
          scriptAlternativesLength: Array.isArray(contentData.script_alternatives) ? contentData.script_alternatives.length : 0,
          hasVideoUrl: !!contentData.video_url,
          hasScriptText: !!contentData.script_text
        });

        if (contentData.script_alternatives && Array.isArray(contentData.script_alternatives) && contentData.script_alternatives.length > 0) {
          setScriptAlternatives(contentData.script_alternatives as unknown as ScriptAlternative[]);
          hasValidScriptAlternatives = true;
          console.log('ScriptEditor: Valid script alternatives found and set:', contentData.script_alternatives.length, 'alternatives');
        }

        if (contentData.video_url) {
          setExistingVideoUrl(contentData.video_url);
          console.log('ScriptEditor: Video URL found:', contentData.video_url);
        }

        if (contentData.script_text && !initialScript) {
          setScript(contentData.script_text);
          console.log('ScriptEditor: Script text loaded from database');
        }
      } else if (contentError) {
        console.log('ScriptEditor: No content data found or error:', contentError);
      }

      // Determine if we have processed data and should show review interface
      const hasProcessedData = hasValidFinancialData || hasValidScriptAlternatives;
      setHasProcessedData(hasProcessedData);
      
      console.log('ScriptEditor: Data processing assessment:', {
        hasValidFinancialData,
        hasValidScriptAlternatives,
        hasProcessedData,
        projectStatus: projectData.status
      });

      // Determine if we should show processing workflow
      const needsProcessing = projectData?.pdf_url && 
                            !hasProcessedData && 
                            projectData.status !== 'completed';

      console.log('ScriptEditor: Processing workflow assessment:', {
        hasPdfUrl: !!projectData?.pdf_url,
        needsProcessing,
        currentStatus: projectData.status,
        willShowProcessingWorkflow: needsProcessing || projectData.status === 'processing'
      });

      if (needsProcessing || projectData.status === 'processing') {
        setShowProcessingWorkflow(true);
        setProcessing(projectData.status === 'processing');
      } else {
        setShowProcessingWorkflow(false);
        setProcessing(false);
      }

      setDataLoadingState('loaded');

    } catch (error) {
      console.error('ScriptEditor: Error in fetchProjectData:', error);
      setDataLoadingState('error');
      toast({
        title: "Fel",
        description: "Kunde inte ladda projektdata. Försök igen.",
        variant: "destructive",
      });
    }
  };

  // Show processing workflow if needed
  if (dataLoadingState === 'loading') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Laddar projektdata...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showProcessingWorkflow) {
    console.log('ScriptEditor: Rendering ProcessingWorkflow component');
    return (
      <div className="space-y-6">
        <ProcessingWorkflow 
          projectId={projectId}
          isProcessing={isProcessing}
          currentStep={0}
          autoStart={!isProcessing && projectStatus !== 'completed'}
          onComplete={handleProcessingComplete}
        />
      </div>
    );
  }

  console.log('ScriptEditor: Rendering main tabs interface with data:', {
    hasFinancialData: !!financialData,
    scriptAlternativesCount: scriptAlternatives.length,
    hasProcessedData
  });

  return (
    <div className="space-y-6">
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
              onScriptSelect={handleScriptSelect}
              onCustomizeScript={handleCustomizeScript}
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
                  <Button onClick={() => setShowProcessingWorkflow(true)}>
                    <Brain className="w-4 h-4 mr-2" />
                    Starta AI-bearbetning
                  </Button>
                  {dataLoadingState === 'error' && (
                    <Button variant="outline" onClick={fetchProjectData}>
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
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Videomanus Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{estimatedDuration} min
                  </Badge>
                  <Badge variant="outline">
                    {script.split(' ').filter(word => word.length > 0).length} ord
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Script Editor */}
              <div className="space-y-2">
                <label htmlFor="script" className="text-sm font-medium">
                  Videomanus
                </label>
                <Textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Skriv eller redigera ditt videomanus här..."
                  className="min-h-[300px] resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={isSaving || !script.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sparar...' : 'Spara manus'}
                </Button>
                
                <Button variant="outline" onClick={handlePreview} disabled={!script.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  Förhandsgranska
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowProcessingWorkflow(true)} 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Regenerera Script
                </Button>
              </div>

              {/* Tips */}
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <h5 className="font-medium mb-1">AI-optimerat manus:</h5>
                <ul className="text-slate-600 space-y-1">
                  <li>• Baserat på extraherad finansiell data från din rapport</li>
                  <li>• Optimerat för professionell video-presentation</li>
                  <li>• Inkluderar konkreta siffror och viktiga insights</li>
                  <li>• Anpassat för svensk affärskommunikation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default ScriptEditor;
