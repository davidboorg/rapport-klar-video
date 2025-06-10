
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: Date;
  completedTime?: Date;
  errorMessage?: string;
  details?: any;
}

export interface ProcessingPipeline {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  currentStepIndex: number;
  overallProgress: number;
  estimatedTimeRemaining: number;
  steps: ProcessingStep[];
  startTime: Date;
  lastUpdate: Date;
  canPause: boolean;
  canResume: boolean;
  metadata: any;
}

const defaultSteps: Omit<ProcessingStep, 'id'>[] = [
  {
    name: 'Uploading PDF',
    description: 'Securely uploading your quarterly report...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 10000 // 10 seconds
  },
  {
    name: 'Extracting Financial Data',
    description: 'Parsing document and extracting financial metrics...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 20000 // 20 seconds
  },
  {
    name: 'Analyzing Content',
    description: 'AI analysis of key insights and performance data...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 15000 // 15 seconds
  },
  {
    name: 'Generating Scripts',
    description: 'Creating personalized video scripts for your audience...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 20000 // 20 seconds
  },
  {
    name: 'Creating Voice Audio',
    description: 'Generating professional voice narration...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 25000 // 25 seconds
  },
  {
    name: 'Generating Video',
    description: 'Your avatar is presenting the content...',
    progress: 0,
    status: 'pending',
    estimatedDuration: 60000 // 60 seconds
  }
];

export const useProcessingPipeline = (projectId: string) => {
  const [pipeline, setPipeline] = useState<ProcessingPipeline | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize pipeline
  const initializePipeline = useCallback(() => {
    const steps: ProcessingStep[] = defaultSteps.map((step, index) => ({
      ...step,
      id: `step_${index}`,
    }));

    const newPipeline: ProcessingPipeline = {
      id: `pipeline_${Date.now()}`,
      projectId,
      status: 'queued',
      currentStepIndex: 0,
      overallProgress: 0,
      estimatedTimeRemaining: steps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      steps,
      startTime: new Date(),
      lastUpdate: new Date(),
      canPause: true,
      canResume: false,
      metadata: {}
    };

    setPipeline(newPipeline);
    return newPipeline;
  }, [projectId]);

  // Start processing
  const startProcessing = async () => {
    const newPipeline = initializePipeline();
    setIsProcessing(true);
    
    // Store pipeline state in localStorage for persistence
    localStorage.setItem(`pipeline_${projectId}`, JSON.stringify(newPipeline));

    toast({
      title: "Processing Started",
      description: "Your report is being processed. You can safely leave this page.",
    });

    // Start the processing simulation
    simulateProcessing(newPipeline);
  };

  // Simulate processing with realistic progress
  const simulateProcessing = async (initialPipeline: ProcessingPipeline) => {
    let currentPipeline = { ...initialPipeline };
    currentPipeline.status = 'processing';

    for (let stepIndex = 0; stepIndex < currentPipeline.steps.length; stepIndex++) {
      const step = currentPipeline.steps[stepIndex];
      
      // Start step
      currentPipeline.currentStepIndex = stepIndex;
      currentPipeline.steps[stepIndex] = {
        ...step,
        status: 'processing',
        startTime: new Date(),
        progress: 0
      };

      setPipeline({ ...currentPipeline });
      addNotification(`Starting: ${step.name}`);

      // Simulate step progress
      await simulateStepProgress(currentPipeline, stepIndex);

      // Complete step
      currentPipeline.steps[stepIndex] = {
        ...currentPipeline.steps[stepIndex],
        status: 'completed',
        progress: 100,
        completedTime: new Date(),
        actualDuration: Date.now() - (currentPipeline.steps[stepIndex].startTime?.getTime() || 0)
      };

      // Update overall progress
      currentPipeline.overallProgress = ((stepIndex + 1) / currentPipeline.steps.length) * 100;
      currentPipeline.estimatedTimeRemaining = calculateRemainingTime(currentPipeline, stepIndex + 1);
      currentPipeline.lastUpdate = new Date();

      setPipeline({ ...currentPipeline });
      
      toast({
        title: "Step Completed",
        description: `${step.name} finished successfully`,
      });

      // Save progress
      localStorage.setItem(`pipeline_${projectId}`, JSON.stringify(currentPipeline));
    }

    // Complete pipeline
    currentPipeline.status = 'completed';
    currentPipeline.overallProgress = 100;
    currentPipeline.estimatedTimeRemaining = 0;
    setPipeline({ ...currentPipeline });
    setIsProcessing(false);

    toast({
      title: "Processing Complete!",
      description: "Your video is ready for viewing and download.",
    });

    // Clean up localStorage
    localStorage.removeItem(`pipeline_${projectId}`);
  };

  // Simulate individual step progress
  const simulateStepProgress = async (pipeline: ProcessingPipeline, stepIndex: number) => {
    const step = pipeline.steps[stepIndex];
    const progressIncrement = Math.random() * 15 + 5; // 5-20% increments
    const updateInterval = step.estimatedDuration / (100 / progressIncrement);

    return new Promise<void>((resolve) => {
      const progressInterval = setInterval(() => {
        const currentStep = pipeline.steps[stepIndex];
        const newProgress = Math.min(currentStep.progress + progressIncrement, 95);
        
        pipeline.steps[stepIndex] = {
          ...currentStep,
          progress: newProgress
        };

        // Add realistic status messages
        if (newProgress > 25 && newProgress < 30) {
          addNotification(getDetailedStatusMessage(step.name, 'quarter'));
        } else if (newProgress > 50 && newProgress < 55) {
          addNotification(getDetailedStatusMessage(step.name, 'half'));
        } else if (newProgress > 75 && newProgress < 80) {
          addNotification(getDetailedStatusMessage(step.name, 'three_quarters'));
        }

        setPipeline({ ...pipeline });

        if (newProgress >= 95) {
          clearInterval(progressInterval);
          resolve();
        }
      }, updateInterval);
    });
  };

  // Get detailed status messages
  const getDetailedStatusMessage = (stepName: string, progress: 'quarter' | 'half' | 'three_quarters') => {
    const messages: Record<string, Record<string, string>> = {
      'Uploading PDF': {
        quarter: 'Establishing secure connection...',
        half: 'Transferring document data...',
        three_quarters: 'Verifying file integrity...'
      },
      'Extracting Financial Data': {
        quarter: 'Parsing 47-page quarterly report...',
        half: 'Found 23 financial metrics, extracting key data...',
        three_quarters: 'Validating extracted financial information...'
      },
      'Analyzing Content': {
        quarter: 'Identifying key performance indicators...',
        half: 'Analyzing market trends and comparisons...',
        three_quarters: 'Generating insights and recommendations...'
      },
      'Generating Scripts': {
        quarter: 'Creating executive summary script...',
        half: 'Adapting content for different audiences...',
        three_quarters: 'Optimizing script timing and flow...'
      },
      'Creating Voice Audio': {
        quarter: 'Preparing voice synthesis parameters...',
        half: 'Generating professional voice narration...',
        three_quarters: 'Applying audio enhancement and timing...'
      },
      'Generating Video': {
        quarter: 'Loading your avatar and scene setup...',
        half: 'Your avatar is presenting the content...',
        three_quarters: 'Rendering final video with transitions...'
      }
    };

    return messages[stepName]?.[progress] || `Processing ${stepName.toLowerCase()}...`;
  };

  // Calculate remaining time
  const calculateRemainingTime = (pipeline: ProcessingPipeline, completedSteps: number) => {
    const remainingSteps = pipeline.steps.slice(completedSteps);
    return remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  };

  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev.slice(-4), message]); // Keep last 5 notifications
  };

  // Pause processing
  const pauseProcessing = () => {
    if (pipeline) {
      const updatedPipeline = {
        ...pipeline,
        status: 'paused' as const,
        canPause: false,
        canResume: true
      };
      setPipeline(updatedPipeline);
      setIsProcessing(false);
      
      toast({
        title: "Processing Paused",
        description: "You can resume processing anytime.",
      });
    }
  };

  // Resume processing
  const resumeProcessing = () => {
    if (pipeline && pipeline.status === 'paused') {
      const updatedPipeline = {
        ...pipeline,
        status: 'processing' as const,
        canPause: true,
        canResume: false
      };
      setPipeline(updatedPipeline);
      setIsProcessing(true);
      
      toast({
        title: "Processing Resumed",
        description: "Continuing from where we left off...",
      });

      // Continue from current step
      simulateProcessing(updatedPipeline);
    }
  };

  // Retry failed step
  const retryFailedStep = async () => {
    if (pipeline && pipeline.status === 'failed') {
      const stepIndex = pipeline.currentStepIndex;
      const updatedPipeline = {
        ...pipeline,
        status: 'processing' as const,
        steps: pipeline.steps.map((step, index) => 
          index === stepIndex 
            ? { ...step, status: 'pending' as const, progress: 0, errorMessage: undefined }
            : step
        )
      };
      
      setPipeline(updatedPipeline);
      setIsProcessing(true);
      
      toast({
        title: "Retrying Step",
        description: "Attempting to process the failed step again...",
      });

      // Retry from current step
      simulateProcessing(updatedPipeline);
    }
  };

  // Load persisted pipeline on mount
  useEffect(() => {
    const savedPipeline = localStorage.getItem(`pipeline_${projectId}`);
    if (savedPipeline) {
      try {
        const parsed = JSON.parse(savedPipeline);
        setPipeline(parsed);
        if (parsed.status === 'processing') {
          setIsProcessing(true);
          simulateProcessing(parsed);
        }
      } catch (error) {
        console.error('Failed to load saved pipeline:', error);
        localStorage.removeItem(`pipeline_${projectId}`);
      }
    }
  }, [projectId]);

  // Real-time subscriptions for status updates
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`processing_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processing_steps',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Processing step update:', payload);
          // Handle real-time updates from database
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    pipeline,
    isProcessing,
    showTechnicalDetails,
    notifications,
    startProcessing,
    pauseProcessing,
    resumeProcessing,
    retryFailedStep,
    setShowTechnicalDetails,
    addNotification
  };
};
