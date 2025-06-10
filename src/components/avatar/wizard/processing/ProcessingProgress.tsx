
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { formatTimeRemaining } from '../processingUtils';

interface ProcessingProgressProps {
  progress: number;
  estimatedTimeRemaining: number;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  progress, 
  estimatedTimeRemaining 
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Avatar creation progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>
      
      {/* Time Remaining Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Tid kvar:</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {formatTimeRemaining(estimatedTimeRemaining)}
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-700">
          Avatar-skapandet pågår. Processen kan inte avbrytas eller pausas.
        </div>
      </div>
    </div>
  );
};
