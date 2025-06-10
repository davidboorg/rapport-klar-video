
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Brain, 
  Wand2, 
  CheckCircle, 
  Clock,
  TrendingUp,
  MessageSquare,
  Zap
} from "lucide-react";

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

interface ProcessingWorkflowProps {
  isProcessing: boolean;
  currentStep?: number;
  onComplete?: (result: any) => void;
}

const ProcessingWorkflow = ({ isProcessing, currentStep = 0, onComplete }: ProcessingWorkflowProps) => {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'pdf-analysis',
      title: 'PDF-analys',
      description: 'Läser och analyserar din kvartalsrapport',
      icon: FileText,
      status: 'pending'
    },
    {
      id: 'data-extraction',
      title: 'Dataextraktion',
      description: 'Extraherar nyckeltal och finansiella mätvärden',
      icon: TrendingUp,
      status: 'pending'
    },
    {
      id: 'content-analysis',
      title: 'Innehållsanalys',
      description: 'Identifierar höjdpunkter och viktiga insights',
      icon: Brain,
      status: 'pending'
    },
    {
      id: 'script-generation',
      title: 'Script-generering',
      description: 'Skapar tre olika script-alternativ',
      icon: MessageSquare,
      status: 'pending'
    },
    {
      id: 'quality-check',
      title: 'Kvalitetskontroll',
      description: 'Verifierar innehåll och faktacheck',
      icon: CheckCircle,
      status: 'pending'
    }
  ]);

  useEffect(() => {
    if (!isProcessing) return;

    const updateSteps = async () => {
      const updatedSteps = [...steps];
      
      for (let i = 0; i <= currentStep && i < steps.length; i++) {
        if (i < currentStep) {
          updatedSteps[i].status = 'completed';
          updatedSteps[i].progress = 100;
        } else if (i === currentStep) {
          updatedSteps[i].status = 'processing';
          // Simulate progress for current step
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            updatedSteps[i].progress = Math.min(progress, 90);
            setSteps([...updatedSteps]);
            
            if (progress >= 90) {
              clearInterval(progressInterval);
              if (i === steps.length - 1) {
                updatedSteps[i].status = 'completed';
                updatedSteps[i].progress = 100;
                setSteps([...updatedSteps]);
                onComplete?.(true);
              }
            }
          }, 500);
        }
      }
      
      setSteps(updatedSteps);
    };

    updateSteps();
  }, [isProcessing, currentStep]);

  const getStepIcon = (step: ProcessingStep) => {
    const IconComponent = step.icon;
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'processing') {
      return <IconComponent className="w-5 h-5 text-blue-600 animate-pulse" />;
    } else {
      return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Klar</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Bearbetar</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700">Fel</Badge>;
      default:
        return <Badge variant="outline">Väntar</Badge>;
    }
  };

  const overallProgress = steps.filter(s => s.status === 'completed').length / steps.length * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Intelligent Rapportbearbetning
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Framsteg</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                step.status === 'processing' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : step.status === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{step.title}</h4>
                  {getStepStatus(step)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                
                {step.status === 'processing' && step.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={step.progress} className="w-full h-2" />
                  </div>
                )}
              </div>

              {step.status === 'processing' && (
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                <strong>AI arbetar med din rapport...</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Detta tar vanligtvis 30-60 sekunder beroende på rapportens storlek
              </p>
            </div>
          )}

          {!isProcessing && overallProgress === 100 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  Bearbetning klar!
                </p>
              </div>
              <p className="text-xs text-green-600">
                Dina script-alternativ är redo för granskning
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingWorkflow;
