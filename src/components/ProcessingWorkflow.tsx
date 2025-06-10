
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { ProcessingWorkflowProps } from './processing/types';
import { useProcessingWorkflow } from '@/hooks/useProcessingWorkflow';
import ProcessingStepCard from './processing/ProcessingStepCard';
import ProcessingStatusMessages from './processing/ProcessingStatusMessages';
import ProcessingActionButtons from './processing/ProcessingActionButtons';

const ProcessingWorkflow: React.FC<ProcessingWorkflowProps> = ({
  projectId,
  isProcessing: externalProcessing,
  currentStep: externalCurrentStep,
  autoStart = true,
  onComplete
}) => {
  const {
    internalProcessing,
    currentStep,
    pdfContent,
    hasStarted,
    steps,
    setHasStarted,
    startProcessing
  } = useProcessingWorkflow(projectId, autoStart, onComplete);

  const isProcessing = externalProcessing || internalProcessing;

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const currentStepProgress = steps[currentStep]?.progress || 0;
    return Math.round((completedSteps * 100 + currentStepProgress) / steps.length);
  };

  const handleStartProcessing = () => {
    setHasStarted(true);
    startProcessing();
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
              <ProcessingStepCard
                key={step.id}
                step={step}
                index={index}
                isCurrentStep={index === currentStep}
                isProcessing={isProcessing}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <ProcessingActionButtons
            isProcessing={isProcessing}
            hasStarted={hasStarted}
            steps={steps}
            onStartProcessing={handleStartProcessing}
          />

          {/* Status Messages */}
          <ProcessingStatusMessages
            isProcessing={isProcessing}
            currentStep={currentStep}
            steps={steps}
            pdfContent={pdfContent}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingWorkflow;
