import React, { useState } from 'react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, AlertCircle, Upload, Brain, FileText, Headphones } from 'lucide-react';
import DemoUploadStep from './DemoUploadStep';
import ProcessingStep from './ProcessingStep';
import ScriptReviewStep from './ScriptReviewStep';
import { useDocumentExtraction } from '@/hooks/useDocumentExtraction';
import { RealApiIntegration } from '@/lib/realApiIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type WorkflowStep = 'upload' | 'processing' | 'script' | 'audio' | 'complete';

interface WorkflowState {
  currentStep: WorkflowStep;
  progress: number;
  file: File | null;
  extractedText: string;
  script: string;
  audioUrl: string | null;
  
  projectId: string | null;
}

const DEMO_TEXT = `IMPORTANT INFO – BOARD MEETING AHEAD: THE JUNGLE LAB

Dear Board Members,

Our next meeting won't take place in a boardroom. You're being flown to the heart of our operation – a real jungle. This is where we're building the world's most adaptive battery lab: The Jungle Lab.

This is not a metaphor. It's a functioning R&D and production ecosystem in a tropical environment. Nature sets the rules. We adapt. Just like in the open market.

We believe a lab should be like a zoo – alive, unpredictable, and full of learning. Engineers, biologists, off-grid specialists and software developers work side by side. It's loud. It's humid. It's productive.

We're not building for comfort. We're building for resilience. If it works here, it will work anywhere.

OUR NUMBERS – Q2 2025
Revenue: SEK 118 million (up from SEK 81 million in Q1)
Gross margin: 41%
Battery capacity deployed: 68 MWh across three microgrid pilots
Confirmed industry partners: 3 (incl. a European defense contractor)
Prototype-to-install time: Reduced from 84 to 49 days

OUR NEXT STEP: SEK 20 BILLION RAISE
To scale our concept globally, we are raising SEK 20 billion (~EUR 1.7B / USD 1.8B). The funds will be allocated to:

1. Infrastructure – SEK 11.2B
4 new lab units across 3 continents
Modular, AI-driven production
On-site solar and hydrogen systems

2. R&D – SEK 8.8B
Development of biomaterial-reactive battery cells using moss and mycelium
Adaptive battery management software
Global feedback/data platform

We're not pitching fantasy. We're pitching proof – and building a decentralized, sustainable alternative to today's mega-factories.

WHAT TO EXPECT
During the meeting, we'll present:
Term sheets from two institutional investors
Patent activity and roadmap
Site plan for Jungle Lab Alpha II
Risk and resilience strategy

This isn't about following trends. It's about building quietly and boldly where others don't dare.

We look forward to seeing you in the jungle. Wear boots. Bring questions.

Warm regards,
The Jungle Lab Team`;

const ModernWorkflowController: React.FC = () => {
  const [state, setState] = useState<WorkflowState>({
    currentStep: 'upload',
    progress: 0,
    file: null,
    extractedText: '',
    script: '',
    audioUrl: null,
    
    projectId: null
  });

  const { extractDocumentContent, isExtracting } = useDocumentExtraction({ silent: true });
  const { toast } = useToast();

  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'processing', label: 'Processing', icon: Brain },
    { id: 'script', label: 'Script', icon: FileText },
    { id: 'audio', label: 'Audio', icon: Headphones },
    
    { id: 'complete', label: 'Complete', icon: CheckCircle }
  ];

  const handleDemoUpload = async () => {
    console.log('Starting demo upload workflow...');
    
    try {
      setState(prev => ({ ...prev, currentStep: 'processing', progress: 20 }));

      // Create project for demo
      console.log('Creating demo project...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Du måste vara inloggad för att skapa projekt');
      }
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: 'ReportFlow Demo: The Jungle Lab',
          description: 'Demo content from The Jungle Lab board meeting',
          status: 'processing',
          user_id: user.id
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw new Error(`Failed to create project: ${projectError.message}`);
      }

      const projectId = project.id;
      console.log('Project created successfully:', projectId);
      
      setState(prev => ({ 
        ...prev, 
        projectId, 
        extractedText: DEMO_TEXT,
        progress: 60 
      }));


      // Generate script directly from demo text
      console.log('Generating script with demo text...');
      const scriptResult = await RealApiIntegration.generateScript({
        projectId,
        extractedText: DEMO_TEXT,
        documentType: 'board',
        targetAudience: 'board'
      });

      console.log('Script generation result:', scriptResult);

      setState(prev => ({ 
        ...prev, 
        script: scriptResult.script,
        currentStep: 'script',
        progress: 80 
      }));


    } catch (error) {
      console.error('Demo upload workflow error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Demo Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, currentStep: 'upload', progress: 0 }));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setState(prev => ({ ...prev, file, currentStep: 'processing', progress: 20 }));

      // Create project
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Du måste vara inloggad för att skapa projekt');
      }
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `ReportFlow: ${file.name}`,
          description: 'AI-generated content from uploaded document',
          status: 'processing',
          user_id: user.id
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
        currentStep: 'complete',
        progress: 100 
      }));


    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleDownloadAudio = async () => {
    if (!state.audioUrl) return;
    try {
      const res = await fetch(state.audioUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const match = state.audioUrl.split('/').pop()?.split('?')[0];
      const fileName = match && match.endsWith('.mp3') ? match : 'podcast.mp3';
      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error('Download failed, opening in new tab as fallback:', err);
      toast({
        title: 'Nedladdning misslyckades',
        description: 'Försöker öppna filen i en ny flik.',
        variant: 'destructive',
      });
      if (state.audioUrl) {
        window.open(state.audioUrl, '_blank');
      }
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'upload':
        return <DemoUploadStep onUpload={handleFileUpload} onDemoUpload={handleDemoUpload} />;
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
            <div className="grid grid-cols-5 gap-2">
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
              
              <div className="grid grid-cols-1 gap-4">
                {state.audioUrl && (
                  <ModernButton variant="glass" className="w-full" onClick={handleDownloadAudio}>
                    Ladda ner MP3
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
