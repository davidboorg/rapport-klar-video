
import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { ProcessingStep } from './types';

interface ProcessingStatusMessagesProps {
  isProcessing: boolean;
  currentStep: number;
  steps: ProcessingStep[];
  pdfContent: string;
}

const ProcessingStatusMessages: React.FC<ProcessingStatusMessagesProps> = ({
  isProcessing,
  currentStep,
  steps,
  pdfContent
}) => {
  return (
    <div className="space-y-4">
      {/* Processing Status */}
      {isProcessing && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-900">
              {steps[currentStep]?.title || 'Bearbetar...'}
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {currentStep === 1 ? 
              'AI-analysen pågår och kan ta 30-60 sekunder. Detta är normalt för komplexa rapporter.' :
              'Vänligen vänta medan bearbetningen pågår.'
            }
          </p>
        </div>
      )}

      {/* Completion Status */}
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

      {/* PDF Content Info */}
      {pdfContent && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="text-sm font-medium mb-2">PDF-innehåll extraherat:</h5>
          <p className="text-xs text-gray-600">
            {pdfContent.length} tecken extraherade från rapporten
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {pdfContent.length > 200 ? `Preview: ${pdfContent.substring(0, 200)}...` : pdfContent}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatusMessages;
