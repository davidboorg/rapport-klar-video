import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Upload, FileText, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface DemoUploadStepProps {
  onUpload: (file: File) => void;
  onDemoUpload: () => void;
  onUseText: (text: string) => void;
}

const DemoUploadStep: React.FC<DemoUploadStepProps> = ({ onUpload, onDemoUpload, onUseText }) => {
  const [customText, setCustomText] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <ModernCard className="max-w-2xl mx-auto">
      <ModernCardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Upload className="w-16 h-16 text-blue-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Upload Your Document</h3>
            <p className="text-slate-300">
              Upload your financial report or use our demo content to see how ReportFlow works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Demo Option */}
            <div className="p-6 border border-blue-500/30 rounded-lg bg-blue-500/10">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Try Demo Content</h4>
              <p className="text-sm text-slate-300 mb-4">
                Use our sample board meeting report from The Jungle Lab to see ReportFlow in action
              </p>
              <ModernButton onClick={onDemoUpload} className="w-full flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Use Demo Text
              </ModernButton>
            </div>

            {/* File Upload Option */}
            <div className="p-6 border border-slate-600 rounded-lg">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Upload File</h4>
              <p className="text-sm text-slate-300 mb-4">Upload your own PDF or Word document</p>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload">
                <ModernButton variant="glass" className="w-full cursor-pointer">
                  Choose File
                </ModernButton>
              </label>
            </div>

            {/* Direct Text Option */}
            <div className="p-6 border border-slate-600 rounded-lg col-span-1 md:col-span-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Write Text Directly</h4>
              <p className="text-sm text-slate-300 mb-4">
                Paste or write your content here and generate a script without uploading a file
              </p>
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste your content here..."
                className="min-h-[140px]"
              />
              <div className="mt-4">
                <ModernButton
                  variant="glass"
                  className="w-full"
                  onClick={() => customText.trim() && onUseText(customText.trim())}
                  disabled={!customText.trim()}
                >
                  Use This Text
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

export default DemoUploadStep;
