
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingStep } from '@/components/processing/types';

export const useProcessingWorkflow = (
  projectId: string,
  autoStart: boolean,
  onComplete: (result: { success: boolean; data?: any; error?: string }) => void
) => {
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [hasStarted, setHasStarted] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'pdf-fetch',
      title: 'Hämtar PDF-innehåll',
      description: 'Laddar ned och förbereder PDF-filen för analys',
      status: 'pending',
      progress: 0
    },
    {
      id: 'ai-analysis',
      title: 'AI-analys av rapporten',
      description: 'Extraherar finansiella nyckeltal och skapar högkvalitativa manuscriptförslag',
      status: 'pending',
      progress: 0
    },
    {
      id: 'data-processing',
      title: 'Bearbetar och strukturerar data',
      description: 'Organiserar finansiell information och script-alternativ',
      status: 'pending',
      progress: 0
    },
    {
      id: 'finalization',
      title: 'Slutför bearbetning',
      description: 'Förbereder allt för presentation och videogenerering',
      status: 'pending',
      progress: 0
    }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (autoStart && !internalProcessing && !pdfContent && !hasStarted) {
      setHasStarted(true);
      startProcessing();
    }
  }, [autoStart, projectId, hasStarted]);

  const updateStepStatus = (stepIndex: number, status: ProcessingStep['status'], progress: number = 0) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status, progress }
        : step
    ));
  };

  const updateStepProgress = (stepIndex: number, progress: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, progress: Math.min(progress, 100) }
        : step
    ));
  };

  const fetchPdfContent = async (): Promise<string> => {
    try {
      console.log('Fetching PDF content for project:', projectId);
      
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }
      
      if (!projectData?.pdf_url) {
        throw new Error('Ingen PDF-fil hittades för detta projekt');
      }

      console.log('Found PDF URL:', projectData.pdf_url);
      updateStepProgress(0, 30);

      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('extract-pdf-content', {
        body: { 
          pdfUrl: projectData.pdf_url,
          projectId: projectId
        }
      });

      if (pdfError) {
        console.error('PDF extraction error:', pdfError);
        throw pdfError;
      }

      if (!pdfData?.content) {
        throw new Error('Kunde inte extrahera innehåll från PDF:en');
      }

      console.log('PDF content extracted successfully. Length:', pdfData.content.length, 'characters');
      updateStepProgress(0, 90);
      
      return pdfData.content;
    } catch (error) {
      console.error('Error in fetchPdfContent:', error);
      throw new Error(`PDF-extraktion misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
  };

  const performAIAnalysis = async (content: string) => {
    try {
      console.log('Starting AI analysis with content length:', content.length);
      updateStepProgress(1, 10);

      toast({
        title: "Startar djupgående AI-analys",
        description: "Extraherar finansiella nyckeltal och genererar professionella script-alternativ...",
      });

      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          pdfText: content
        }
      });

      if (aiError) {
        console.error('AI analysis error:', aiError);
        throw new Error(`AI-analys misslyckades: ${aiError.message || 'Okänt fel'}`);
      }

      if (!aiData?.success) {
        console.error('AI analysis failed:', aiData);
        throw new Error(`AI-analys misslyckades: ${aiData?.error || 'Okänt fel från AI-tjänsten'}`);
      }

      console.log('AI analysis completed successfully');
      console.log('Financial data extracted:', aiData.financial_data ? 'Yes' : 'No');
      
      updateStepProgress(1, 100);
      return aiData;
    } catch (error) {
      console.error('Error in performAIAnalysis:', error);
      throw error;
    }
  };

  const startProcessing = async () => {
    console.log('Starting processing workflow for project:', projectId);
    setInternalProcessing(true);
    setCurrentStep(0);

    try {
      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));

      // Step 1: PDF Content Extraction
      console.log('=== STEP 1: PDF EXTRACTION ===');
      setCurrentStep(0);
      updateStepStatus(0, 'processing', 10);
      
      const content = await fetchPdfContent();
      setPdfContent(content);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(0, 'completed', 100);

      console.log('Step 1 completed. PDF content length:', content.length);

      // Step 2: AI Analysis (The critical step)
      console.log('=== STEP 2: AI ANALYSIS ===');
      setCurrentStep(1);
      updateStepStatus(1, 'processing', 5);
      
      const aiData = await performAIAnalysis(content);
      updateStepStatus(1, 'completed', 100);

      // Step 3: Data Processing
      console.log('=== STEP 3: DATA PROCESSING ===');
      setCurrentStep(2);
      updateStepStatus(2, 'processing', 30);
      
      // Simulate data organization
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepProgress(2, 80);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus(2, 'completed', 100);

      // Step 4: Finalization
      console.log('=== STEP 4: FINALIZATION ===');
      setCurrentStep(3);
      updateStepStatus(3, 'processing', 40);
      
      // Update project status
      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectUpdateError) {
        console.error('Error updating project status:', projectUpdateError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepProgress(3, 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(3, 'completed', 100);

      console.log('=== PROCESSING COMPLETED SUCCESSFULLY ===');

      toast({
        title: "Bearbetning slutförd!",
        description: "Finansiella nyckeltal extraherade och professionella script-alternativ genererade.",
      });

      onComplete({ success: true, data: aiData });

    } catch (error) {
      console.error('=== PROCESSING FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel uppstod under bearbetningen';
      
      updateStepStatus(currentStep, 'error', 0);
      
      // Update project status to failed
      await supabase
        .from('projects')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
      
      toast({
        title: "Bearbetning misslyckades",
        description: errorMessage,
        variant: "destructive",
      });

      onComplete({ success: false, error: errorMessage });
    } finally {
      setInternalProcessing(false);
    }
  };

  return {
    internalProcessing,
    currentStep,
    pdfContent,
    hasStarted,
    steps,
    setHasStarted,
    startProcessing
  };
};
