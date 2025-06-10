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
import { 
  Save, 
  Play, 
  Clock, 
  FileText, 
  Wand2,
  RefreshCw,
  Film,
  Brain
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
  const [processingStep, setProcessingStep] = useState(0);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [scriptAlternatives, setScriptAlternatives] = useState<ScriptAlternative[]>([]);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const { toast } = useToast();

  // Calculate estimated video duration (150 words per minute speaking rate)
  const estimatedDuration = Math.ceil(script.split(' ').filter(word => word.length > 0).length / 150);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project financial data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data, status, pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      if (projectData?.financial_data) {
        setFinancialData(projectData.financial_data as FinancialData);
        setHasProcessedData(true);
      }

      // Fetch existing script alternatives and video
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_text, script_alternatives, video_url')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!contentError && contentData) {
        if (contentData.script_alternatives) {
          setScriptAlternatives(contentData.script_alternatives as unknown as ScriptAlternative[]);
          setHasProcessedData(true);
        }
        if (contentData.video_url) {
          setExistingVideoUrl(contentData.video_url);
        }
        if (contentData.script_text && !initialScript) {
          setScript(contentData.script_text);
        }
      }

      // Trigger processing if we have PDF but no processed data
      if (projectData?.pdf_url && !projectData?.financial_data && projectData?.status !== 'processing') {
        startIntelligentProcessing();
      }

    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const startIntelligentProcessing = async () => {
    setProcessing(true);
    setProcessingStep(0);

    try {
      // Simulate processing steps with realistic timing
      const steps = [
        { step: 0, delay: 1000, message: 'Analyserar PDF-innehåll...' },
        { step: 1, delay: 2000, message: 'Extraherar finansiella nyckeltal...' },
        { step: 2, delay: 1500, message: 'Identifierar viktiga insights...' },
        { step: 3, delay: 3000, message: 'Genererar script-alternativ...' },
        { step: 4, delay: 1000, message: 'Utför kvalitetskontroll...' }
      ];

      for (const { step, delay, message } of steps) {
        setProcessingStep(step);
        toast({
          title: "Bearbetar rapport",
          description: message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Call the enhanced edge function
      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          pdfText: "Placeholder text - this would be the actual PDF content"
        }
      });

      if (error) throw error;

      if (data?.financial_data) {
        setFinancialData(data.financial_data);
        setHasProcessedData(true);
      }

      if (data?.script_alternatives) {
        setScriptAlternatives(data.script_alternatives);
        setScript(data.script_alternatives[0]?.script || '');
      }

      toast({
        title: "Bearbetning klar!",
        description: "Din rapport har analyserats och script-alternativ har genererats.",
      });

    } catch (error) {
      console.error('Error in intelligent processing:', error);
      toast({
        title: "Fel",
        description: "Kunde inte bearbeta rapporten. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          script_text: script,
          generation_status: 'completed',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Manus sparat",
        description: "Ditt videomanus har sparats framgångsrikt.",
      });

      onScriptUpdate?.(script);
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara manuset. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScriptSelect = (selectedScript: ScriptAlternative) => {
    setScript(selectedScript.script);
    toast({
      title: "Script valt",
      description: `${selectedScript.title} har valts som ditt videomanus.`,
    });
  };

  const handleCustomizeScript = (customizedScript: string) => {
    setScript(customizedScript);
    toast({
      title: "Script anpassat",
      description: "Dina anpassningar har tillämpats.",
    });
  };

  const handlePreview = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = 'sv-SE';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Förhandsvisning ej tillgänglig",
        description: "Din webbläsare stöder inte tal-förhandsvisning.",
        variant: "destructive",
      });
    }
  };

  // Show processing workflow if processing or no data yet
  if (isProcessing || (!hasProcessedData && !scriptAlternatives.length)) {
    return (
      <div className="space-y-6">
        <ProcessingWorkflow 
          isProcessing={isProcessing}
          currentStep={processingStep}
          onComplete={() => {
            setProcessing(false);
            fetchProjectData();
          }}
        />
        
        {!isProcessing && !hasProcessedData && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-2">Redo för intelligent bearbetning</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ladda upp en PDF-rapport för att starta automatisk analys och script-generering.
              </p>
              <Button onClick={startIntelligentProcessing}>
                <Wand2 className="w-4 h-4 mr-2" />
                Starta Bearbetning
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

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
                <h3 className="font-medium mb-2">Ingen bearbetad data tillgänglig</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ladda upp en PDF-rapport för att få AI-genererade script-alternativ.
                </p>
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
                  onClick={startIntelligentProcessing} 
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
