
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useScriptEditorData } from "@/hooks/useScriptEditorData";
import { useScriptEditorUpload } from "@/hooks/useScriptEditorUpload";
import AdvancedProcessingViewer from "./processing/AdvancedProcessingViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileText, Mic, Upload, Shield } from "lucide-react";
import PodcastGeneration from "./content/PodcastGeneration";
import UploadTab from "./script-editor/UploadTab";
import ReviewTab from "./script-editor/ReviewTab";
import ScriptTab from "./script-editor/ScriptTab";

interface ScriptEditorContentProps {
  projectId: string;
  initialScript?: string;
  onScriptUpdate?: (script: string) => void;
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
  const [marketType, setMarketType] = useState<'ir' | 'board'>('ir');
  const { toast } = useToast();

  // Use custom hooks for data and upload logic
  const { financialData, scriptAlternatives, fetchProjectData } = useScriptEditorData(projectId);
  const { 
    showProcessing, 
    setShowProcessing, 
    handleFileUpload,
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress
  } = useScriptEditorUpload(projectId);

  useEffect(() => {
    const storedMarket = localStorage.getItem('selectedMarket') as 'ir' | 'board';
    if (storedMarket) {
      setMarketType(storedMarket);
    }
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    const result = await fetchProjectData();
    if (typeof result === 'string') {
      setScript(result || initialScript);
    } else if (result?.shouldShowProcessing) {
      setShowProcessing(true);
    }
  };

  const handleFileUploadWithRefresh = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileUpload(event, marketType);
    
    if (result?.success) {
      // Refresh project data after successful processing
      await loadProjectData();
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
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="w-12 h-12 text-blue-600" />
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Advanced AI Processing</h3>
              <p className="text-gray-600">
                Your document is being processed using our secure EU-compliant AI system with intelligent document chunking and multi-stage analysis via Supabase Functions.
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
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>
        
        <TabsContent value="upload">
          <UploadTab 
            marketType={marketType}
            onFileUpload={handleFileUploadWithRefresh}
          />
        </TabsContent>
        
        <TabsContent value="review">
          <ReviewTab
            financialData={financialData}
            scriptAlternatives={scriptAlternatives}
            onScriptSelect={handleScriptSelect}
          />
        </TabsContent>
        
        <TabsContent value="script">
          <ScriptTab
            script={script}
            setScript={setScript}
            marketType={marketType}
            isSaving={isSaving}
            onSave={handleSave}
          />
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
        
      </Tabs>
    </div>
  );
};

export default ScriptEditorContent;
