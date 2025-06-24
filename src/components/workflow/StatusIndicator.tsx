
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Brain, 
  FileText, 
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
    { key: 'processing', label: 'Bearbetar', icon: Brain },
    { key: 'scriptReview', label: 'Granska manus', icon: FileText },
    { key: 'audio', label: 'Generera podcast', icon: Mic },
    { key: 'video', label: 'Video (kommer snart)', icon: Video },
    { key: 'download', label: 'Ladda ner', icon: Download }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: any, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const IconComponent = step.icon;
    
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (status === 'current') {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadge = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700">Klar</Badge>;
    } else if (status === 'current') {
      return <Badge className="bg-blue-100 text-blue-700">Pågår</Badge>;
    } else {
      return <Badge variant="outline">Väntar</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Framsteg</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Status */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-900">{status}</span>
            </div>
          </div>

          {/* Steps Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Workflow-steg</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {steps.map((step, index) => (
                <div 
                  key={step.key}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    getStepStatus(index) === 'current' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : getStepStatus(index) === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50'
                  }`}
                >
                  {getStepIcon(step, index)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{step.label}</div>
                    <div className="mt-1">
                      {getStepBadge(index)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;
