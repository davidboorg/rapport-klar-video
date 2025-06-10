
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw } from 'lucide-react';
import { ProcessingStep } from './types';

interface ProcessingActionButtonsProps {
  isProcessing: boolean;
  hasStarted: boolean;
  steps: ProcessingStep[];
  onStartProcessing: () => void;
}

const ProcessingActionButtons: React.FC<ProcessingActionButtonsProps> = ({
  isProcessing,
  hasStarted,
  steps,
  onStartProcessing
}) => {
  return (
    <div className="flex gap-2 pt-4 border-t">
      {!isProcessing && !hasStarted && (
        <Button onClick={onStartProcessing} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Starta bearbetning
        </Button>
      )}
      
      {!isProcessing && steps.some(step => step.status === 'completed') && (
        <Button variant="outline" onClick={onStartProcessing} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Kör om bearbetning
        </Button>
      )}
    </div>
  );
};

export default ProcessingActionButtons;
