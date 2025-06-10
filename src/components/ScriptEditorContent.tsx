
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
      
      console.log('ScriptEditor: Project data fetched:', {
        status: projectData.status,
        hasFinancialData: !!projectData?.financial_data,
        financialDataKeys: projectData?.financial_data ? Object.keys(projectData.financial_data) : [],
        hasPdfUrl: !!projectData?.pdf_url
      });

      setProjectStatus(projectData.status);

      // Check if we have valid financial data with more robust validation
      let hasValidFinancialData = false;
      if (projectData?.financial_data) {
        const financialDataObj = projectData.financial_data as FinancialData;
        console.log('ScriptEditor: Financial data content:', financialDataObj);
        
        // More comprehensive check for valid financial data
        const hasRealData = Object.entries(financialDataObj).some(([key, value]) => {
          if (typeof value === 'string') {
            const isValidData = value !== 'Information saknas' && 
                               value.trim() !== '' && 
                               value !== 'N/A' &&
                               value !== 'null' &&
                               value !== 'undefined';
            if (isValidData && ['revenue', 'ebitda', 'growth_percentage', 'period'].includes(key)) {
              return true;
            }
          }
          if (Array.isArray(value)) {
            return value.length > 0 && !value.every(item => 
              item === 'Information saknas' || item === '' || item === 'N/A'
            );
          }
          return value !== null && value !== undefined;
        });

        // Even if some fields say "Information saknas", if we have period/revenue/ebitda we consider it valid
        const hasKeyFinancials = financialDataObj.period || financialDataObj.revenue || financialDataObj.ebitda;

        if (hasRealData || hasKeyFinancials) {
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
          // Validate that script alternatives have actual content
          const validAlternatives = contentData.script_alternatives.filter((alt: any) => 
            alt && alt.script && alt.script.trim().length > 50
          );
          
          if (validAlternatives.length > 0) {
            setScriptAlternatives(validAlternatives as unknown as ScriptAlternative[]);
            hasValidScriptAlternatives = true;
            console.log('ScriptEditor: Valid script alternatives found and set:', validAlternatives.length, 'alternatives');
          }
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

      // Show processing workflow if:
      // 1. We have a PDF but no processed data, OR
      // 2. Project status is currently 'processing', OR
      // 3. Project status is 'failed' but we want to retry
      const shouldShowProcessing = (
        (projectData?.pdf_url && !hasProcessedData) ||
        projectData.status === 'processing' ||
        (projectData.status === 'failed' && !hasProcessedData)
      );

      console.log('ScriptEditor: Processing workflow assessment:', {
        hasPdfUrl: !!projectData?.pdf_url,
        shouldShowProcessing,
        currentStatus: projectData.status,
        hasProcessedData
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
    projectStatus
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
