
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="pt-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-red-900">Något gick fel</h4>
            <p className="text-sm text-red-700">
              Din avatar kunde inte skapas. Försök igen eller kontakta support.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={onRetry} variant="outline" className="border-red-300">
            Försök igen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
