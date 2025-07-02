
import React, { useRef, useState } from 'react';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadStepProps {
  onUpload: (file: File) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onUpload(file);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <ModernCard className="max-w-2xl mx-auto">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-3">
          <Upload className="w-6 h-6" />
          Upload Your Document
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-blue-400 bg-blue-500/10 scale-105'
              : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <FileText className="w-20 h-20 text-blue-400 mx-auto mb-6" />
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop your document here or click to browse
              </h3>
              <p className="text-slate-300">
                Upload your financial report, board briefing, or quarterly document
              </p>
            </div>
            
            <ModernButton size="lg" className="mx-auto">
              <Upload className="w-5 h-5 mr-2" />
              Choose File
            </ModernButton>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>PDF, DOC, DOCX</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Max 50MB</span>
              </div>
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
      </ModernCardContent>
    </ModernCard>
  );
};

export default UploadStep;
