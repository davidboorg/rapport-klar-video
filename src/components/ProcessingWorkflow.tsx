import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Play,
  RefreshCw 
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface ProcessingWorkflowProps {
  projectId: string;
  isProcessing: boolean;
  currentStep: number;
  autoStart?: boolean;
  onComplete: (result: { success: boolean; data?: any; error?: string }) => void;
}

const ProcessingWorkflow: React.FC<ProcessingWorkflowProps> = ({
  projectId,
  isProcessing: externalProcessing,
  currentStep: externalCurrentStep,
  autoStart = true,
  onComplete
}) => {
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

  const isProcessing = externalProcessing || internalProcessing;

  useEffect(() => {
    if (autoStart && !isProcessing && !pdfContent && !hasStarted) {
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

      // Step 2: AI Analysis (the main processing step that takes real time)
      console.log('Starting Step 2: AI Analysis - This will take some time...');
      setCurrentStep(1);
      updateStepStatus(1, 'processing', 5);
      
      toast({
        title: "Startar AI-analys",
        description: "Detta kan ta 30-60 sekunder. Vänligen vänta...",
      });

      // Show gradual progress during AI processing
      const progressInterval = setInterval(() => {
        setSteps(prev => prev.map((step, index) => 
          index === 1 && step.progress < 80
            ? { ...step, progress: step.progress + Math.random() * 5 + 2 }
            : step
        ));
      }, 2000);

      console.log('Calling AI function with PDF content, length:', content.length);

      // Call the AI analysis function with the extracted content
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          pdfText: content
        }
      });

      clearInterval(progressInterval);

      if (aiError) {
        console.error('AI processing error:', aiError);
        updateStepStatus(1, 'error', 0);
        throw new Error(aiError.message || 'AI-bearbetning misslyckades');
      }

      console.log('AI processing successful:', aiData);
      updateStepStatus(1, 'completed', 100);

      // Step 3: Data Processing (quick step)
      console.log('Starting Step 3: Data Processing');
      setCurrentStep(2);
      updateStepStatus(2, 'processing', 30);
      
      // Give some time to show this step
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepProgress(2, 80);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus(2, 'completed', 100);

      // Step 4: Finalization (quick step)
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

  const fetchPdfContent = async (): Promise<string> => {
    try {
      // Get project data to find PDF URL
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

      // Call edge function to extract PDF content
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

  const getStepIcon = (step: ProcessingStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (step.status === 'processing') {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
  };

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const currentStepProgress = steps[currentStep]?.progress || 0;
    return Math.round((completedSteps * 100 + currentStepProgress) / steps.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Intelligent Rapport-bearbetning
            </CardTitle>
            <Badge variant={isProcessing ? "default" : "secondary"}>
              {isProcessing ? 'Pågår' : 'Redo'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total framsteg</span>
              <span className="text-sm text-gray-600">{getOverallProgress()}%</span>
            </div>
            <Progress value={getOverallProgress()} className="w-full" />
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  index === currentStep && isProcessing 
                    ? 'bg-blue-50 border border-blue-200' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                {getStepIcon(step, index)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    {step.status === 'processing' && (
                      <span className="text-xs text-blue-600">{Math.round(step.progress)}%</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  {step.status === 'processing' && (
                    <Progress value={step.progress} className="w-full mt-2 h-1" />
                  )}
                  {step.id === 'ai-analysis' && step.status === 'processing' && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      ⏳ AI-analysen pågår - detta tar normalt 30-60 sekunder
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {!isProcessing && !hasStarted && (
              <Button onClick={() => {
                setHasStarted(true);
                startProcessing();
              }} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Starta bearbetning
              </Button>
            )}
            
            {!isProcessing && steps.some(step => step.status === 'completed') && (
              <Button variant="outline" onClick={() => {
                setHasStarted(true);
                startProcessing();
              }} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Kör om bearbetning
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-900">
                  {steps[currentStep]?.title || 'Bearbetar...'}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {currentStep === 1 ? 
                  'AI-analysen pågår och kan ta 30-60 sekunder. Detta är normalt för komplexa rapporter.' :
                  'Vänligen vänta medan bearbetningen pågår.'
                }
              </p>
            </div>
          )}

          {steps.every(step => step.status === 'completed') && !isProcessing && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Bearbetning slutförd!
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Din rapport har analyserats och manuscriptförslag är redo att granska.
              </p>
            </div>
          )}

          {pdfContent && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium mb-2">PDF-innehåll extraherat:</h5>
              <p className="text-xs text-gray-600">
                {pdfContent.length} tecken extraherade från rapporten
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pdfContent.length > 200 ? `Preview: ${pdfContent.substring(0, 200)}...` : pdfContent}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingWorkflow;
