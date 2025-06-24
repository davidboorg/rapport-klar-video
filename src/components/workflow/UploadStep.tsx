
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface UploadStepProps {
  onUpload: (file: File) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Ladda upp rapport
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Välj en PDF-rapport att bearbeta
          </p>
          <Button onClick={handleClick} className="mb-4">
            Välj fil
          </Button>
          <p className="text-sm text-gray-500">
            Stöder PDF-filer upp till 10MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default UploadStep;
