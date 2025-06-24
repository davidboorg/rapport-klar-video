
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileSearch } from 'lucide-react';

const ProcessingStep: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="w-5 h-5" />
          Bearbetar rapport
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 mb-2">
            Analyserar innehållet i rapporten...
          </p>
          <p className="text-sm text-gray-500">
            Detta kan ta några sekunder
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStep;
