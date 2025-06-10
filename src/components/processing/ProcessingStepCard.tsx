
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ProcessingStep } from './types';

interface ProcessingStepCardProps {
  step: ProcessingStep;
  index: number;
  isCurrentStep: boolean;
  isProcessing: boolean;
}

const ProcessingStepCard: React.FC<ProcessingStepCardProps> = ({
  step,
  index,
  isCurrentStep,
  isProcessing
}) => {
  const getStepIcon = () => {
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

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        isCurrentStep && isProcessing 
          ? 'bg-blue-50 border border-blue-200' 
          : step.status === 'completed'
          ? 'bg-green-50 border border-green-200'
          : step.status === 'error'
          ? 'bg-red-50 border border-red-200'
          : 'bg-gray-50'
      }`}
    >
      {getStepIcon()}
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
  );
};

export default ProcessingStepCard;
