import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, AlertCircle, Upload, Brain, FileText, Headphones, Video } from 'lucide-react';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import { useDocumentExtraction } from '@/hooks/useDocumentExtraction';
import { RealApiIntegration } from '@/lib/realApiIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type WorkflowStep = 'upload' | 'processing' | 'script' | 'audio' | 'video' | 'complete';

interface WorkflowState {
  currentStep: WorkflowStep;
  progress: number;
  file: File | null;
  extractedText: string;
  script: string;
  audioUrl: string | null;
  videoUrl: string | null;
  projectId: string | null;
}

const ModernWorkflowController: React.FC = () => {
  const [state, setState] = useState<WorkflowState>({
    currentStep: 'upload',
    progress: 0,
    file: null,
    extractedText: '',
    script: '',
    audioUrl: null,
    videoUrl: null,
    projectId: null
  });

  const { extractDocumentContent, isExtracting } = useDocumentExtraction();
  const { toast } = useToast();

  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'processing', label: 'Processing', icon: Brain },
    { id: 'script', label: 'Script', icon: FileText },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'complete', label: 'Complete', icon: CheckCircle }
  ];

  const handleFileUpload = async (file: File) => {
    try {
      setState(prev => ({ ...prev, file, currentStep: 'processing', progress: 20 }));

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `ReportFlow: ${file.name}`,
          description: 'AI-generated content from uploaded document',
          status: 'processing',
          user_id: '00000000-0000-0000-0000-000000000000' // Demo user
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const projectId = project.id;
      setState(prev => ({ ...prev, projectId, progress: 40 }));

      // Extract document content
      const extractionResult = await extractDocumentContent(file, projectId);
      
      if (!extractionResult.success || !extractionResult.content) {
        throw new Error(extractionResult.error || 'Failed to extract content');
      }

      setState(prev => ({ 
        ...prev, 
        extractedText: extractionResult.content!, 
        progress: 60 
      }));

      // Generate script
      const scriptResult = await RealApiIntegration.generateScript({
        projectId,
        extractedText: extractionResult.content!,
        documentType: 'quarterly',
        targetAudience: 'investors'
      });

      setState(prev => ({ 
        ...prev, 
        script: scriptResult.script,
        currentStep: 'script',
        progress: 80 
      }));

      toast({
        title: "Document Processed Successfully",
        description: "Your script has been generated and is ready for review.",
      });

    } catch (error) {
      console.error('Upload workflow error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
      setState(prev => ({ ...prev, currentStep: 'upload', progress: 0 }));
    }
  };

  const handleScriptApprove = async () => {
    if (!state.projectId || !state.script) return;

    try {
      setState(prev => ({ ...prev, currentStep: 'audio', progress: 85 }));

      // Generate podcast
      const podcastResult = await RealApiIntegration.generatePodcast({
        projectId: state.projectId,
        scriptText: state.script
      });

      setState(prev => ({ 
        ...prev, 
        audioUrl: podcastResult.audioUrl,
        currentStep: 'video',
        progress: 90 
      }));

      // Generate video
      const videoResult = await RealApiIntegration.generateVideo({
        projectId: state.projectId,
        scriptText: state.script
      });

      setState(prev => ({ 
        ...prev, 
        videoUrl: videoResult.videoUrl,
        currentStep: 'complete',
        progress: 100 
      }));

      toast({
        title: "Content Generation Complete",
        description: "Your audio and video content are ready!",
      });

    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'upload':
        return <UploadStep onUpload={handleFileUpload} />;
      case 'processing':
        return <ProcessingStep />;
      case 'script':
        return (
          <ScriptReviewStep 
            script={state.script} 
            onApprove={handleScriptApprove}
          />
        );
      default:
        return (
          <ModernCard className="max-w-2xl mx-auto text-center p-8">
            <div className="space-y-4">
              <Clock className="w-16 h-16 text-blue-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">
                {state.currentStep === 'complete' ? 'All Done!' : 'Processing...'}
              </h3>
              <p className="text-slate-300">
                {state.currentStep === 'complete' 
                  ? 'Your content has been generated successfully'
                  : 'Please wait while we generate your content'
                }
              </p>
            </div>
          </ModernCard>
        );
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ReportFlow Workflow
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Transform your financial documents into professional videos and podcasts with AI
          </p>
        </div>

        {/* Progress Bar */}
        <ModernCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Progress</h3>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {Math.round(state.progress)}% Complete
              </Badge>
            </div>
            <Progress value={state.progress} className="h-2" />
            
            {/* Step Indicators */}
            <div className="grid grid-cols-6 gap-2">
              {steps.map((step, index) => {
                const isActive = step.id === state.currentStep;
                const isCompleted = steps.findIndex(s => s.id === state.currentStep) > index;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="text-center space-y-2">
                    <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted ? 'bg-green-500/20 text-green-400 border-2 border-green-500' :
                      isActive ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500' :
                      'bg-slate-700/50 text-slate-400 border-2 border-slate-600'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-medium ${
                      isActive ? 'text-blue-400' : 
                      isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </ModernCard>

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Results */}
        {state.currentStep === 'complete' && (
          <ModernCard className="p-6">
            <div className="text-center space-y-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Content Generated Successfully!</h3>
                <p className="text-slate-300">Your professional content is ready for download and sharing.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.audioUrl && (
                  <ModernButton variant="glass" className="w-full">
                    Download Audio
                  </ModernButton>
                )}
                {state.videoUrl && (
                  <ModernButton className="w-full">
                    Download Video
                  </ModernButton>
                )}
              </div>
            </div>
          </ModernCard>
        )}
      </div>
    </div>
  );
};

export default ModernWorkflowController;
