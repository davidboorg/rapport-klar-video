
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
      description: 'Extraherar finansiella nyckeltal och skapar manuscriptförslag',
      status: 'pending',
      progress: 0
    },
    {
      id: 'data-processing',
      title: 'Bearbetar data',
      description: 'Strukturerar och sparar den extraherade informationen',
      status: 'pending',
      progress: 0
    },
    {
      id: 'finalization',
      title: 'Slutför bearbetning',
      description: 'Förbereder resultatet för visning',
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
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      if (!projectData?.pdf_url) {
        throw new Error('Ingen PDF-fil hittades för detta projekt');
      }

      console.log('Fetching PDF from URL:', projectData.pdf_url);

      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('extract-pdf-content', {
        body: { 
          pdfUrl: projectData.pdf_url,
          projectId: projectId
        }
      });

      if (pdfError) throw pdfError;

      if (!pdfData?.content) {
        throw new Error('Kunde inte extrahera innehåll från PDF:en');
      }

      console.log('PDF content extracted, length:', pdfData.content.length, 'characters');
      return pdfData.content;
    } catch (error) {
      console.error('Error fetching PDF content:', error);
      throw new Error(`Kunde inte hämta PDF-innehåll: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
  };

  const startProcessing = async () => {
    setInternalProcessing(true);
    setCurrentStep(0);

    try {
      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));

      // Step 1: Fetch PDF content
      console.log('Starting Step 1: PDF Extraction');
      setCurrentStep(0);
      updateStepStatus(0, 'processing', 10);
      
      updateStepProgress(0, 30);
      const content = await fetchPdfContent();
      setPdfContent(content);
      
      updateStepProgress(0, 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(0, 'completed', 100);

      console.log('Step 1 completed, PDF content length:', content.length);

      // Step 2: AI Analysis
      console.log('Starting Step 2: AI Analysis - This will take some time...');
      setCurrentStep(1);
      updateStepStatus(1, 'processing', 5);
      
      toast({
        title: "Startar AI-analys",
        description: "Detta kan ta 30-60 sekunder. Vänligen vänta...",
      });

      console.log('Calling AI function with PDF content, length:', content.length);

      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          pdfText: content
        }
      });

      if (aiError) {
        console.error('AI processing error:', aiError);
        updateStepStatus(1, 'error', 0);
        throw new Error(aiError.message || 'AI-bearbetning misslyckades');
      }

      console.log('AI processing successful:', aiData);
      updateStepStatus(1, 'completed', 100);

      // Step 3: Data Processing
      console.log('Starting Step 3: Data Processing');
      setCurrentStep(2);
      updateStepStatus(2, 'processing', 30);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepProgress(2, 80);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus(2, 'completed', 100);

      // Step 4: Finalization
      console.log('Starting Step 4: Finalization');
      setCurrentStep(3);
      updateStepStatus(3, 'processing', 40);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepProgress(3, 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(3, 'completed', 100);

      // Update project status to completed
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

      console.log('All processing steps completed successfully');

      toast({
        title: "Bearbetning klar!",
        description: "Din rapport har analyserats och manuscriptförslag är redo.",
      });

      onComplete({ success: true, data: aiData });

    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel uppstod';
      
      updateStepStatus(currentStep, 'error', 0);
      
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
