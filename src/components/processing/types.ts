
export interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

export interface ProcessingWorkflowProps {
  projectId: string;
  isProcessing: boolean;
  currentStep: number;
  autoStart?: boolean;
  onComplete: (result: { success: boolean; data?: any; error?: string }) => void;
}
