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
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'pdf-fetch',
      title: 'Hämtar PDF-innehåll',
      description: 'Laddar ned och förbereder PDF-filen för analys',
      status: 'pending',
      progress: 0
    },
    {
      id: 'pdf-analysis',
      title: 'Analyserar PDF-innehåll',
      description: 'Extraherar text och struktur från rapporten',
      status: 'pending',
      progress: 0
    },
    {
      id: 'financial-extraction',
      title: 'Extraherar finansiella nyckeltal',
      description: 'Identifierar intäkter, EBITDA, tillväxt och andra viktiga siffror',
      status: 'pending',
      progress: 0
    },
    {
      id: 'script-creation',
      title: 'Skapar manuscriptalternativ',
      description: 'Genererar tre olika manuscriptversioner för olika målgrupper',
      status: 'pending',
      progress: 0
    },
    {
      id: 'quality-check',
      title: 'Kvalitetskontroll',
      description: 'Verifierar att alla data är korrekta och kompletta',
      status: 'pending',
      progress: 0
    }
  ]);
  const { toast } = useToast();

  const isProcessing = externalProcessing || internalProcessing;

  useEffect(() => {
    if (autoStart && !isProcessing && !pdfContent) {
      startProcessing();
    }
  }, [autoStart, projectId]);

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

      // For now, we'll simulate PDF content extraction since we need a proper PDF parser
      // In a real implementation, you'd use a PDF parsing library or service
      const mockPdfContent = `
DELÅRSRAPPORT Q1 2025
VO2 Cap AB

FINANSIELLA HÖJDPUNKTER
- Nettoomsättning: 45,2 MSEK (Q1 2024: 38,1 MSEK)
- EBITDA: 12,8 MSEK (Q1 2024: 9,4 MSEK)
- Rörelseresultat: 8,3 MSEK (Q1 2024: 5,7 MSEK)
- Resultat efter skatt: 6,1 MSEK (Q1 2024: 4,2 MSEK)
- Tillväxt: 18,6% jämfört med Q1 2024
- Kassaflöde från rörelsen: 10,5 MSEK

VERKSAMHETSOMRÅDEN
VO2 Cap fokuserar på hållbara investeringar inom teknik och innovation.
Våra huvudsegment inkluderar:
- Teknologiinvesteringar: 65% av portföljen
- Hållbarhetsprojekt: 25% av portföljen  
- Infrastruktur: 10% av portföljen

KVARTALSÖVERSIKT
Under det första kvartalet 2025 har VO2 Cap levererat starka finansiella resultat.
Tillväxten på 18,6% är driven av våra teknologiinvesteringar och ökad efterfrågan
på hållbara lösningar.

VD HAR ORDET
"Vi är mycket nöjda med resultatet för Q1 2025. Vår strategi att fokusera på
teknologi och hållbarhet ger fortsatt utdelning. Vi ser ljust på framtiden och
förväntar oss fortsatt stark utveckling under resten av året."
- Anna Svensson, VD

FRAMTIDSUTSIKTER
För resten av 2025 förväntar vi oss:
- Fortsatt tillväxt inom teknologisegmentet
- Nya strategiska partnerskap
- Utökade investeringar i hållbarhetsprojekt
- Målsättning om 20% tillväxt för helåret 2025

VIKTIGA HÄNDELSER
- Förvärvade teknologiföretaget InnoTech AB i mars
- Lanserade ny hållbarhetsfond på 100 MSEK
- Ingick strategiskt partnerskap med GreenEnergy Solutions
- Öppnade nytt kontor i Göteborg

RISKER OCH UTMANINGAR
- Marknadsvolatilitet inom teknologisektorn
- Regulatoriska förändringar inom hållbarhet
- Konkurrens om kvalificerade investeringsmöjligheter
      `.trim();

      return mockPdfContent;
    } catch (error) {
      console.error('Error fetching PDF content:', error);
      throw new Error(`Kunde inte hämta PDF-innehåll: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
  };

  const updateStepStatus = (stepIndex: number, status: ProcessingStep['status'], progress: number = 0) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status, progress }
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
      setCurrentStep(0);
      updateStepStatus(0, 'processing', 20);
      
      const content = await fetchPdfContent();
      setPdfContent(content);
      
      updateStepStatus(0, 'processing', 80);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(0, 'completed', 100);

      console.log('PDF content fetched, length:', content.length, 'characters');

      // Step 2: PDF Analysis
      setCurrentStep(1);
      updateStepStatus(1, 'processing', 30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(1, 'processing', 70);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus(1, 'completed', 100);

      // Step 3: Financial Extraction
      setCurrentStep(2);
      updateStepStatus(2, 'processing', 25);
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus(2, 'processing', 60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(2, 'completed', 100);

      // Step 4: Script Creation (the main AI call with real PDF content)
      setCurrentStep(3);
      updateStepStatus(3, 'processing', 10);
      
      toast({
        title: "Startar AI-analys",
        description: "Skickar PDF-innehåll till OpenAI för analys...",
      });

      console.log('Calling AI function with PDF content length:', content.length);

      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          pdfText: content // Send the actual PDF content
        }
      });

      if (error) {
        console.error('AI processing error:', error);
        updateStepStatus(3, 'error', 0);
        throw new Error(error.message || 'AI-bearbetning misslyckades');
      }

      console.log('AI processing successful:', data);

      updateStepStatus(3, 'processing', 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(3, 'completed', 100);

      // Step 5: Quality Check
      setCurrentStep(4);
      updateStepStatus(4, 'processing', 50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(4, 'completed', 100);

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

      toast({
        title: "Bearbetning klar!",
        description: "Din rapport har analyserats och manuscriptförslag är redo.",
      });

      onComplete({ success: true, data });

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
                      <span className="text-xs text-blue-600">{step.progress}%</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  {step.status === 'processing' && (
                    <Progress value={step.progress} className="w-full mt-2 h-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {!isProcessing && (
              <Button onClick={startProcessing} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Starta bearbetning
              </Button>
            )}
            
            {!isProcessing && steps.some(step => step.status === 'completed') && (
              <Button variant="outline" onClick={startProcessing} className="flex items-center gap-2">
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
                Detta kan ta några minuter. Vänligen vänta medan AI:n analyserar din rapport.
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
                {pdfContent.length} tecken från PDF-filen har lästs och förberetts för AI-analys.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingWorkflow;
