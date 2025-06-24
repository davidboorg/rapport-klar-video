
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useScriptEditorData = (projectId: string) => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [scriptAlternatives, setScriptAlternatives] = useState<ScriptAlternative[]>([]);
  const { toast } = useToast();

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
        if (contentData.script_alternatives && Array.isArray(contentData.script_alternatives)) {
          // Safely convert Json[] to ScriptAlternative[] by validating the structure
          const alternatives = (contentData.script_alternatives as unknown as ScriptAlternative[])
            .filter((alt: any) => 
              alt && 
              typeof alt === 'object' && 
              alt.type && 
              alt.title && 
              alt.script
            );
          setScriptAlternatives(alternatives);
        }
        
        return contentData.script_text || "";
      }

      // Show processing if we have a PDF but no processed data
      const hasProcessedData = !!(projectData?.financial_data || 
        (contentData?.script_alternatives && Array.isArray(contentData.script_alternatives)));
      
      return {
        shouldShowProcessing: projectData?.pdf_url && !hasProcessedData,
        scriptText: ""
      };

    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Loading Error",
        description: "Could not load project data. Please try again.",
        variant: "destructive",
      });
      return { shouldShowProcessing: false, scriptText: "" };
    }
  };

  return {
    financialData,
    scriptAlternatives,
    fetchProjectData,
    setFinancialData,
    setScriptAlternatives
  };
};
