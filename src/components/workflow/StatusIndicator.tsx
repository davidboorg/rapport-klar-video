
import React from 'react';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { WorkflowStep } from './WorkflowController';

interface StatusIndicatorProps {
  status: string;
  currentStep: WorkflowStep;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, currentStep }) => {
  const steps = [
    { key: 'upload', label: 'Uppladdning' },
    { key: 'processing', label: 'Bearbetning' },
    { key: 'scriptReview', label: 'Manus' },
    { key: 'audio', label: 'Ljud' },
    { key: 'video', label: 'Video' },
    { key: 'download', label: 'Nedladdning' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-blue-800 font-medium">{status}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentIndex 
                  ? 'bg-green-500 text-white' 
                  : index === currentIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-1 ${
                index <= currentIndex ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={`w-4 h-4 ${
                index < currentIndex ? 'text-green-500' : 'text-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatusIndicator;
