
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProcessingWorkflow from "./ProcessingWorkflow";
import ScriptEditorTabs from "./ScriptEditorTabs";
import ScriptEditorLoading from "./ScriptEditorLoading";
import { useScriptEditorActions } from "./ScriptEditorHelpers";

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
      
      console.log('ScriptEditor: Raw project data from database:', projectData);
      console.log('ScriptEditor: Financial data type:', typeof projectData?.financial_data);
      console.log('ScriptEditor: Financial data content:', JSON.stringify(projectData?.financial_data, null, 2));

      setProjectStatus(projectData.status);

      // Always set financial data if it exists, regardless of content
      if (projectData?.financial_data) {
        setFinancialData(projectData.financial_data as FinancialData);
        console.log('ScriptEditor: Financial data set in state');
      } else {
        console.log('ScriptEditor: No financial data found in project');
      }

      // Fetch existing script alternatives and video
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_text, script_alternatives, video_url')
        .eq('project_id', projectId)
        .maybeSingle();

      console.log('ScriptEditor: Generated content query result:', { contentData, contentError });

      if (!contentError && contentData) {
        console.log('ScriptEditor: Script alternatives type:', typeof contentData.script_alternatives);
        console.log('ScriptEditor: Script alternatives content:', JSON.stringify(contentData.script_alternatives, null, 2));

        if (contentData.script_alternatives && Array.isArray(contentData.script_alternatives)) {
          setScriptAlternatives(contentData.script_alternatives as unknown as ScriptAlternative[]);
          console.log('ScriptEditor: Script alternatives set in state:', contentData.script_alternatives.length, 'alternatives');
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
        console.log('ScriptEditor: Content data error:', contentError);
      }

      // Determine if we have processed data
      const hasFinancialData = !!(projectData?.financial_data);
      const hasScriptAlternatives = !!(contentData?.script_alternatives && Array.isArray(contentData.script_alternatives) && contentData.script_alternatives.length > 0);
      const hasProcessedData = hasFinancialData || hasScriptAlternatives;
      
      setHasProcessedData(hasProcessedData);
      
      console.log('ScriptEditor: Final state assessment:', {
        hasFinancialData,
        hasScriptAlternatives,
        hasProcessedData,
        projectStatus: projectData.status,
        financialDataKeys: projectData?.financial_data ? Object.keys(projectData.financial_data) : [],
        scriptAlternativesCount: Array.isArray(contentData?.script_alternatives) ? contentData.script_alternatives.length : 0
      });

      // Show processing workflow if we don't have processed data and have a PDF
      const shouldShowProcessing = (
        (projectData?.pdf_url && !hasProcessedData) ||
        projectData.status === 'processing' ||
        (projectData.status === 'failed' && !hasProcessedData)
      );

      console.log('ScriptEditor: Processing workflow decision:', {
        shouldShowProcessing,
        hasPdfUrl: !!projectData?.pdf_url,
        hasProcessedData,
        status: projectData.status
      });

      if (shouldShowProcessing) {
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
    return <ScriptEditorLoading />;
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
    hasProcessedData,
    projectStatus,
    financialDataContent: financialData
  });

  return (
    <div className="space-y-6">
      <ScriptEditorTabs
        projectId={projectId}
        script={script}
        setScript={setScript}
        isSaving={isSaving}
        isProcessing={isProcessing}
        financialData={financialData}
        scriptAlternatives={scriptAlternatives}
        existingVideoUrl={existingVideoUrl}
        dataLoadingState={dataLoadingState}
        onSave={handleSave}
        onPreview={handlePreview}
        onScriptSelect={handleScriptSelect}
        onCustomizeScript={handleCustomizeScript}
        onStartProcessing={() => setShowProcessingWorkflow(true)}
        onRefreshData={fetchProjectData}
      />
    </div>
  );
};

export default ScriptEditorContent;
