
import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Brain, FileText, Loader2, Shield } from 'lucide-react';

const ProcessingStep: React.FC = () => {
  return (
    <ModernCard className="max-w-2xl mx-auto">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-400" />
          Processing Document
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur border border-blue-500/30">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            AI Processing in Progress
          </h3>
          <div className="space-y-2">
            <p className="text-slate-300">
              Your document is being analyzed using advanced AI
            </p>
            <p className="text-sm text-slate-400">
              Extracting key financial data and generating professional scripts
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Text Extraction</p>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">AI Analysis</p>
          </div>
          <div className="text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">EU Compliant</p>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

export default ProcessingStep;
