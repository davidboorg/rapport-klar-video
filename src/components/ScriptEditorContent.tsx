
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

// Helper function to safely convert JSON to ScriptAlternative[]
const parseScriptAlternatives = (data: any): ScriptAlternative[] => {
  console.log('Parsing script alternatives:', data);
  
  if (!Array.isArray(data)) {
    console.log('Data is not an array, returning empty array');
    return [];
  }
  
  const parsed = data.filter((item): item is ScriptAlternative => {
    const isValid = (
      typeof item === 'object' &&
      item !== null &&
      typeof item.type === 'string' &&
      ['executive', 'investor', 'social'].includes(item.type) &&
      typeof item.title === 'string' &&
      typeof item.duration === 'string' &&
      typeof item.script === 'string' &&
      typeof item.tone === 'string' &&
      Array.isArray(item.key_points)
    );
    
    if (!isValid) {
      console.log('Invalid script alternative item:', item);
    }
    
    return isValid;
  });
  
  console.log(`Parsed ${parsed.length} valid script alternatives from ${data.length} items`);
  return parsed;
};

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
  const handleProcessingComplete = (result: { success: boolean; data?: any; error?: string }) => {
    console.log('Processing completed with result:', result);
    processComplete(result, fetchProjectData, setProcessing, setShowProcessingWorkflow);
  };

  useEffect(() => {
    console.log('=== ScriptEditorContent: Initializing ===');
    console.log('Project ID:', projectId);
    fetchProjectData();
    
    // Set up real-time subscription for project changes
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
    console.log('=== Fetching Project Data ===');
    console.log('Project ID:', projectId);
    setDataLoadingState('loading');
    
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data, status, pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }
      
      console.log('Project data fetched:', {
        status: projectData.status,
        hasPdfUrl: !!projectData.pdf_url,
        hasFinancialData: !!projectData.financial_data,
        financialDataKeys: projectData.financial_data ? Object.keys(projectData.financial_data) : []
      });

      setProjectStatus(projectData.status);

      // Process financial data
      if (projectData?.financial_data && typeof projectData.financial_data === 'object') {
        console.log('Setting financial data:', projectData.financial_data);
        setFinancialData(projectData.financial_data as FinancialData);
      } else {
        console.log('No valid financial data found');
        setFinancialData(null);
      }

      // Fetch generated content
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('script_text, script_alternatives, video_url')
        .eq('project_id', projectId)
        .maybeSingle();

      console.log('Generated content query result:', {
        hasData: !!contentData,
        hasScriptAlternatives: !!(contentData?.script_alternatives),
        scriptAlternativesType: typeof contentData?.script_alternatives,
        scriptAlternativesLength: Array.isArray(contentData?.script_alternatives) ? contentData.script_alternatives.length : 'not array',
        error: contentError
      });

      if (!contentError && contentData) {
        // Handle script alternatives with safe type conversion
        if (contentData.script_alternatives) {
          const parsedAlternatives = parseScriptAlternatives(contentData.script_alternatives);
          console.log('Setting script alternatives:', parsedAlternatives.length, 'items');
          setScriptAlternatives(parsedAlternatives);
        } else {
          console.log('No script alternatives in content data');
          setScriptAlternatives([]);
        }

        // Handle video URL
        if (contentData.video_url) {
          setExistingVideoUrl(contentData.video_url);
        }

        // Handle script text
        if (contentData.script_text && !initialScript) {
          setScript(contentData.script_text);
        }
      } else {
        console.log('No generated content found or error:', contentError);
        setScriptAlternatives([]);
      }

      // Determine processing state
      const hasValidFinancialData = !!(projectData?.financial_data && 
        typeof projectData.financial_data === 'object' &&
        Object.keys(projectData.financial_data).length > 0);
      
      const hasValidScriptAlternatives = !!(contentData?.script_alternatives && 
        Array.isArray(contentData.script_alternatives) && 
        contentData.script_alternatives.length > 0);
      
      const hasProcessedData = hasValidFinancialData || hasValidScriptAlternatives;
      
      console.log('Processing state assessment:', {
        hasValidFinancialData,
        hasValidScriptAlternatives,
        hasProcessedData,
        projectStatus: projectData.status
      });

      setHasProcessedData(hasProcessedData);

      // Determine if we should show processing workflow
      const shouldShowProcessing = (
        (projectData?.pdf_url && !hasProcessedData) ||
        projectData.status === 'processing' ||
        (projectData.status === 'failed' && !hasProcessedData)
      );

      console.log('Processing workflow decision:', {
        shouldShowProcessing,
        reason: projectData?.pdf_url && !hasProcessedData ? 'Has PDF but no processed data' :
                projectData.status === 'processing' ? 'Currently processing' :
                projectData.status === 'failed' && !hasProcessedData ? 'Failed and no processed data' :
                'Should not show processing'
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
      console.error('=== Error in fetchProjectData ===');
      console.error('Error details:', error);
      setDataLoadingState('error');
      toast({
        title: "Fel vid laddning",
        description: "Kunde inte ladda projektdata. Försök igen.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (dataLoadingState === 'loading') {
    return <ScriptEditorLoading />;
  }

  // Show processing workflow if needed
  if (showProcessingWorkflow) {
    console.log('=== Rendering ProcessingWorkflow ===');
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

  // Show main tabs interface
  console.log('=== Rendering Main Interface ===');
  console.log('State summary:', {
    hasFinancialData: !!financialData,
    scriptAlternativesCount: scriptAlternatives.length,
    hasProcessedData,
    projectStatus,
    financialDataPreview: financialData ? {
      company_name: financialData.company_name,
      revenue: financialData.revenue,
      period: financialData.period
    } : null
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
