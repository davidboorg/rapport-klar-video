import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProcessingWorkflow from "./ProcessingWorkflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, Film, Mic } from "lucide-react";
import FinancialDataDisplay from "./FinancialDataDisplay";
import ScriptAlternativesDisplay from "./ScriptAlternativesDisplay";
import VideoGeneration from "./VideoGeneration";
import PodcastGeneration from "./content/PodcastGeneration";

interface ScriptEditorContentProps {
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

const ScriptEditorContent = ({ projectId, initialScript = "", onScriptUpdate }: ScriptEditorContentProps) => {
  const [script, setScript] = useState(initialScript);
  const [isSaving, setSaving] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [scriptAlternatives, setScriptAlternatives] = useState<ScriptAlternative[]>([]);
  const [showProcessingWorkflow, setShowProcessingWorkflow] = useState(false);
  const [dataLoadingState, setDataLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const { toast } = useToast();

  const parseScriptAlternatives = (data: any): ScriptAlternative[] => {
    if (!Array.isArray(data)) return [];
    
    return data.filter((item: any) => 
      item && 
      typeof item === 'object' &&
      typeof item.type === 'string' &&
      typeof item.title === 'string' &&
      typeof item.duration === 'string' &&
      typeof item.script === 'string' &&
      typeof item.tone === 'string' &&
      Array.isArray(item.key_points)
    ).map((item: any) => ({
      type: item.type as 'executive' | 'investor' | 'social',
      title: item.title,
      duration: item.duration,
      script: item.script,
      tone: item.tone,
      key_points: item.key_points
    }));
  };

  // Add market type detection
  const [marketType, setMarketType] = useState<'ir' | 'board'>('ir');

  useEffect(() => {
    // Detect market type from localStorage or project data
    const storedMarket = localStorage.getItem('selectedMarket') as 'ir' | 'board';
    if (storedMarket) {
      setMarketType(storedMarket);
    }
  }, []);

  useEffect(() => {
    console.log('ScriptEditorContent: Initializing for project:', projectId);
    fetchProjectData();
    
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
        (payload) => {
          console.log('Project updated via realtime:', payload);
          fetchProjectData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    console.log('Fetching project data for:', projectId);
    setDataLoadingState('loading');
    
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data, status, pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }
      
      console.log('Project data:', {
        status: projectData.status,
        hasPdfUrl: !!projectData.pdf_url,
        hasFinancialData: !!projectData.financial_data
      });

      if (projectData?.financial_data) {
        setFinancialData(projectData.financial_data as FinancialData);
      }

      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_text, script_alternatives')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!contentError && contentData) {
        if (contentData.script_alternatives) {
          const parsedAlternatives = parseScriptAlternatives(contentData.script_alternatives);
          setScriptAlternatives(parsedAlternatives);
        }
        
        if (contentData.script_text && !initialScript) {
          setScript(contentData.script_text);
        }
      }

      const hasProcessedData = !!(projectData?.financial_data || 
        (contentData?.script_alternatives && Array.isArray(contentData.script_alternatives) && contentData.script_alternatives.length > 0));
      
      const shouldShowProcessing = (
        (projectData?.pdf_url && !hasProcessedData) ||
        projectData.status === 'processing'
      );

      if (shouldShowProcessing) {
        setShowProcessingWorkflow(true);
        setProcessing(projectData.status === 'processing');
      } else {
        setShowProcessingWorkflow(false);
        setProcessing(false);
      }

      setDataLoadingState('loaded');

    } catch (error) {
      console.error('Error in fetchProjectData:', error);
      setDataLoadingState('error');
      toast({
        title: "Loading Error",
        description: "Could not load project data. Please try again.",
        variant: "destructive",
      });
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
        title: "Script Saved",
        description: "Your video script has been saved successfully.",
      });

      onScriptUpdate?.(script);
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Save Error",
        description: "Could not save script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScriptSelect = (selectedScript: ScriptAlternative) => {
    setScript(selectedScript.script);
    toast({
      title: "Script Selected",
      description: `${selectedScript.title} has been selected as your video script.`,
    });
  };

  const handleProcessingComplete = (result: { success: boolean; data?: any; error?: string }) => {
    console.log('Processing completed with result:', result);
    setProcessing(false);
    
    if (result.success) {
      setTimeout(() => {
        fetchProjectData();
        setShowProcessingWorkflow(false);
      }, 1000);
      
      toast({
        title: "AI Processing Complete!",
        description: "Your report has been analyzed and script suggestions are ready.",
      });
    } else {
      setShowProcessingWorkflow(false);
      toast({
        title: "Processing Failed",
        description: result.error || "Something went wrong during processing.",
        variant: "destructive",
      });
    }
  };

  if (dataLoadingState === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showProcessingWorkflow) {
    return (
      <div className="space-y-6">
        <ProcessingWorkflow 
          projectId={projectId}
          isProcessing={isProcessing}
          currentStep={0}
          autoStart={!isProcessing}
          onComplete={handleProcessingComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Review & Select
          </TabsTrigger>
          <TabsTrigger value="script" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Edit Script
          </TabsTrigger>
          <TabsTrigger value="podcast" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Generate Podcast
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Generate Video
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="review">
          <div className="space-y-6">
            {financialData && (
              <FinancialDataDisplay data={financialData} />
            )}
            
            {scriptAlternatives.length > 0 && (
              <ScriptAlternativesDisplay 
                alternatives={scriptAlternatives}
                onScriptSelect={handleScriptSelect}
              />
            )}
            
            {!financialData && scriptAlternatives.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium mb-2">No processed data available</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start processing to get AI-generated script suggestions.
                  </p>
                  <Button onClick={() => setShowProcessingWorkflow(true)}>
                    Start Processing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="script">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {marketType === 'ir' ? 'Investor Communication Script' : 'Board Briefing Script'}
                  </label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder={
                      marketType === 'ir' 
                        ? "Enter your investor presentation script here..."
                        : "Enter your board briefing script here..."
                    }
                    className="min-h-[300px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Script'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance(script);
                      utterance.lang = 'en-US';
                      speechSynthesis.speak(utterance);
                    }
                  }}>
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="podcast">
          <PodcastGeneration
            projectId={projectId}
            scriptText={script}
            marketType={marketType}
            onPodcastGenerated={(podcastUrl) => {
              console.log('Podcast generated:', podcastUrl);
            }}
          />
        </TabsContent>
        
        <TabsContent value="video">
          <VideoGeneration
            projectId={projectId}
            scriptText={script}
            financialData={financialData}
            existingVideoUrl={null}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptEditorContent;
