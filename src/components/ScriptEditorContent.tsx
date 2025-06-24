
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedProcessing } from "@/hooks/useAdvancedProcessing";
import AdvancedProcessingViewer from "./processing/AdvancedProcessingViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, Film, Mic, Upload } from "lucide-react";
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
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [scriptAlternatives, setScriptAlternatives] = useState<ScriptAlternative[]>([]);
  const [showProcessing, setShowProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [marketType, setMarketType] = useState<'ir' | 'board'>('ir');
  const { toast } = useToast();

  // Use the new advanced processing hook
  const {
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress,
    processDocument
  } = useAdvancedProcessing(projectId);

  useEffect(() => {
    const storedMarket = localStorage.getItem('selectedMarket') as 'ir' | 'board';
    if (storedMarket) {
      setMarketType(storedMarket);
    }
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data, status, pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
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
          setScriptAlternatives(contentData.script_alternatives);
        }
        
        if (contentData.script_text && !initialScript) {
          setScript(contentData.script_text);
        }
      }

      // Show processing if we have a PDF but no processed data
      const hasProcessedData = !!(projectData?.financial_data || 
        (contentData?.script_alternatives && Array.isArray(contentData.script_alternatives)));
      
      if (projectData?.pdf_url && !hasProcessedData) {
        setShowProcessing(true);
      }

    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Loading Error",
        description: "Could not load project data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setShowProcessing(true);

    // Start the advanced processing pipeline
    const result = await processDocument(file, marketType);
    
    if (result.success) {
      // Refresh project data after successful processing
      await fetchProjectData();
      setShowProcessing(false);
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
        description: "Your script has been saved successfully.",
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
      description: `${selectedScript.title} has been selected.`,
    });
  };

  if (showProcessing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Brain className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced AI Processing</h3>
              <p className="text-gray-600">
                Your document is being processed using Berget.ai's advanced EU-compliant AI system.
              </p>
            </div>
          </CardContent>
        </Card>

        <AdvancedProcessingViewer
          tasks={tasks}
          currentTaskIndex={currentTaskIndex}
          isProcessing={isProcessing}
          overallProgress={overallProgress}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Review
          </TabsTrigger>
          <TabsTrigger value="script" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Script
          </TabsTrigger>
          <TabsTrigger value="podcast" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Podcast
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Video
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Upload className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload Your Document</h3>
                  <p className="text-gray-600 mb-4">
                    Upload your {marketType === 'ir' ? 'quarterly report' : 'board briefing document'} for AI analysis
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Choose PDF File</span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
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
                  <h3 className="font-medium mb-2">No data available</h3>
                  <p className="text-sm text-gray-600">
                    Upload a document to get AI-generated analysis and scripts.
                  </p>
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
