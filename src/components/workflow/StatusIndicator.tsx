
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Eye, 
  Brain, 
  Mic, 
  Video, 
  Download,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { WorkflowStep } from './WorkflowController';

interface StatusIndicatorProps {
  status: string;
  currentStep: WorkflowStep;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, currentStep }) => {
  const steps = [
    { key: 'upload', label: 'Ladda upp', icon: Upload },
    { key: 'processing', label: 'Bearbetar', icon: FileText },
    { key: 'textPreview', label: 'Granska text', icon: Eye },
    { key: 'scriptReview', label: 'Granska manus', icon: Brain },
    { key: 'audio', label: 'Generera podcast', icon: Mic },
    { key: 'video', label: 'Generera video', icon: Video },
    { key: 'download', label: 'Ladda ner', icon: Download },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Workflow Status</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            {currentStep === 'processing' || currentStep === 'textPreview' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            {status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const StepIcon = step.icon;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStepColor(stepStatus)}`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">
                  {step.label}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px mx-3 ${stepStatus === 'completed' ? 'bg-green-300' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;
