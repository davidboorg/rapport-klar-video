
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProcessingStepsProps {
  processingProgress: number;
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ processingProgress }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <h4 className="font-medium">Bearbetningssteg:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Video analys</span>
          </div>
          <div className="flex items-center space-x-2">
            {processingProgress > 30 ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <div className="h-4 w-4 border-2 border-muted rounded-full" />
            }
            <span>Ansiktsigenkänning</span>
          </div>
          <div className="flex items-center space-x-2">
            {processingProgress > 60 ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <div className="h-4 w-4 border-2 border-muted rounded-full" />
            }
            <span>3D-modellering</span>
          </div>
          <div className="flex items-center space-x-2">
            {processingProgress > 85 ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <div className="h-4 w-4 border-2 border-muted rounded-full" />
            }
            <span>Kvalitetskontroll</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Teknisk Information:</h4>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>• HD video processing</p>
          <p>• AI facial mapping</p>
          <p>• Gesture analysis</p>
          <p>• Quality optimization</p>
        </div>
      </div>
    </div>
  );
};
