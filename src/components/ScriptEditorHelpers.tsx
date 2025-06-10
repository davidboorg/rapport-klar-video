
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

export const useScriptEditorActions = (
  projectId: string,
  script: string,
  setScript: (script: string) => void,
  onScriptUpdate?: (script: string) => void
) => {
  const { toast } = useToast();

  const handleSave = async (setSaving: (saving: boolean) => void) => {
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

  const handleProcessingComplete = (
    result: { success: boolean; data?: any; error?: string },
    fetchProjectData: () => void,
    setProcessing: (processing: boolean) => void,
    setShowProcessingWorkflow: (show: boolean) => void
  ) => {
    setProcessing(false);
    
    if (result.success) {
      // Give a small delay to ensure database is updated
      setTimeout(() => {
        fetchProjectData();
        setShowProcessingWorkflow(false);
      }, 1000);
      
      toast({
        title: "AI-bearbetning slutförd!",
        description: "Din rapport har analyserats och manuscriptförslag är redo.",
      });
    } else {
      setShowProcessingWorkflow(false);
      toast({
        title: "Bearbetning misslyckades",
        description: result.error || "Något gick fel under bearbetningen.",
        variant: "destructive",
      });
    }
  };

  return {
    handleSave,
    handleScriptSelect,
    handleCustomizeScript,
    handlePreview,
    handleProcessingComplete
  };
};
