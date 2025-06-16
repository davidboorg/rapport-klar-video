
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  FileText,
  Brain,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessingWorkflowProps {
  projectId: string;
  isProcessing: boolean;
  currentStep: number;
  autoStart?: boolean;
  onComplete: (result: { success: boolean; data?: any; error?: string }) => void;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
}

const ProcessingWorkflow: React.FC<ProcessingWorkflowProps> = ({
  projectId,
  isProcessing: externalIsProcessing,
  currentStep: externalCurrentStep,
  autoStart = false,
  onComplete
}) => {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'pdf-extraction',
      title: 'PDF Innehåll Extrahering',
      description: 'Extraherar text från din finansiella rapport',
      status: 'pending',
      progress: 0,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'ai-analysis',
      title: 'AI Finansiell Analys',
      description: 'Analyserar finansiella nyckeltal och skapar script-alternativ',
      status: 'pending',
      progress: 0,
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'content-generation',
      title: 'Innehåll Generering',
      description: 'Färdigställer scripts och förbereder för video',
      status: 'pending',
      progress: 0,
      icon: <Video className="w-5 h-5" />
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(externalIsProcessing);
  const [currentStep, setCurrentStep] = useState(externalCurrentStep);
  const [hasStarted, setHasStarted] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const { toast } = useToast();

  // Auto-start when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && !hasStarted && !isProcessing) {
      console.log('Auto-starting processing workflow...');
      handleStartProcessing();
    }
  }, [autoStart, hasStarted, isProcessing]);

  const addLog = (message: string) => {
    console.log(`[ProcessingWorkflow] ${message}`);
    setProcessingLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], progress: number = 0) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress }
        : step
    ));
  };

  const handleStartProcessing = async () => {
    try {
      setIsProcessing(true);
      setHasStarted(true);
      setCurrentStep(0);
      addLog('Startar bearbetningsflödet...');

      // Reset all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));

      // Step 1: PDF Extraction
      updateStepStatus('pdf-extraction', 'processing', 10);
      addLog('Hämtar projekt data...');

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('pdf_url')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData?.pdf_url) {
        throw new Error('Kunde inte hitta PDF-fil för projektet');
      }

      addLog(`PDF URL hittad: ${projectData.pdf_url}`);
      updateStepStatus('pdf-extraction', 'processing', 30);

      // Extract PDF content
      addLog('Extraherar PDF innehåll...');
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
        body: {
          pdfUrl: projectData.pdf_url,
          projectId: projectId
        }
      });

      if (extractionError) {
        throw new Error(`PDF extraktion misslyckades: ${extractionError.message}`);
      }

      if (!extractionData?.success || !extractionData?.content) {
        throw new Error('Kunde inte extrahera innehåll från PDF');
      }

      const content = extractionData.content;
      setPdfContent(content);
      addLog(`PDF innehåll extraherat: ${content.length} tecken`);
      updateStepStatus('pdf-extraction', 'completed', 100);

      // Step 2: AI Analysis
      setCurrentStep(1);
      updateStepStatus('ai-analysis', 'processing', 10);
      addLog('Startar AI-analys av finansiella data...');

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: projectId,
          pdfText: content
        }
      });

      if (analysisError) {
        throw new Error(`AI-analys misslyckades: ${analysisError.message}`);
      }

      if (!analysisData?.success) {
        throw new Error(`AI-analys fel: ${analysisData?.error || 'Okänt fel'}`);
      }

      addLog('AI-analys slutförd framgångsrikt');
      updateStepStatus('ai-analysis', 'completed', 100);

      // Step 3: Content Generation (mark as completed since it's done in AI analysis)
      setCurrentStep(2);
      updateStepStatus('content-generation', 'processing', 50);
      addLog('Slutför innehållsgenerering...');

      // Small delay to show the step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStepStatus('content-generation', 'completed', 100);
      addLog('Alla steg slutförda framgångsrikt!');

      setIsProcessing(false);
      
      toast({
        title: "Bearbetning Slutförd!",
        description: "Din finansiella rapport har analyserats och scripts har genererats.",
      });

      onComplete({ 
        success: true, 
        data: analysisData.financial_data 
      });

    } catch (error) {
      console.error('Processing workflow error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel uppstod';
      
      addLog(`FEL: ${errorMessage}`);
      
      // Mark current step as error
      if (currentStep < steps.length) {
        updateStepStatus(steps[currentStep].id, 'error');
      }

      setIsProcessing(false);
      
      toast({
        title: "Bearbetning Misslyckades",
        description: errorMessage,
        variant: "destructive",
      });

      onComplete({ 
        success: false, 
        error: errorMessage 
      });
    }
  };

  const handleRetry = () => {
    setHasStarted(false);
    handleStartProcessing();
  };

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (step.status === 'processing') {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return step.icon;
    }
  };

  const getStepBadge = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Slutförd</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Pågår</Badge>;
      case 'error':
        return <Badge variant="destructive">Fel</Badge>;
      default:
        return <Badge variant="outline">Väntar</Badge>;
    }
  };

  const overallProgress = steps.reduce((acc, step) => acc + step.progress, 0) / steps.length;
  const hasErrors = steps.some(step => step.status === 'error');
  const isCompleted = steps.every(step => step.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Bearbetningsflöde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {isProcessing && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-900">
                  Bearbetar steg {currentStep + 1} av {steps.length}
                </span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Alla steg slutförda! Scripts är redo för granskning.
                </span>
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  Ett fel uppstod under bearbetningen. Försök igen.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bearbetningssteg</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                  step.status === 'processing' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    {getStepBadge(step)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                  
                  {step.status === 'processing' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(step.progress)}%</span>
                      </div>
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {!isProcessing && !hasStarted && (
              <Button onClick={handleStartProcessing} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Starta Bearbetning
              </Button>
            )}
            
            {hasErrors && !isProcessing && (
              <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Försök Igen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Content Preview */}
      {pdfContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Extraherat PDF Innehåll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded border text-xs font-mono">
              <p className="text-gray-600 mb-2">
                {pdfContent.length} tecken extraherade
              </p>
              <div className="max-h-32 overflow-y-auto">
                {pdfContent.substring(0, 500)}...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Logs */}
      {processingLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bearbetningsloggar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {processingLogs.map((log, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessingWorkflow;
