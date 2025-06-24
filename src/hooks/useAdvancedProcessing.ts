
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { bergetDocumentProcessor, ProcessingStage } from '@/integrations/berget/documentProcessor';

export interface ProcessingTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  details?: string;
}

export const useAdvancedProcessing = (projectId: string) => {
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const updateProgress = useCallback((stages: ProcessingStage[]) => {
    // Convert Berget.ai stages to our task format
    const newTasks: ProcessingTask[] = stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      status: stage.status,
      progress: stage.progress,
      details: stage.error || undefined
    }));

    setTasks(newTasks);

    // Calculate overall progress
    const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
    const overallProg = totalProgress / stages.length;
    setOverallProgress(overallProg);

    // Update current task index
    const processingIndex = stages.findIndex(stage => stage.status === 'processing');
    const completedCount = stages.filter(stage => stage.status === 'completed').length;
    
    if (processingIndex !== -1) {
      setCurrentTaskIndex(processingIndex);
    } else if (completedCount === stages.length) {
      setCurrentTaskIndex(stages.length - 1);
    }
  }, []);

  const processDocument = useCallback(async (
    file: File, 
    documentType: 'quarterly' | 'board'
  ) => {
    setIsProcessing(true);
    setCurrentTaskIndex(0);
    setOverallProgress(0);

    try {
      console.log(`Starting advanced processing for ${documentType} document:`, file.name);

      // Show initial toast
      toast({
        title: "Starting Advanced Processing",
        description: `Processing ${documentType} document with Berget.ai EU-compliant AI...`,
      });

      // Process document with Berget.ai
      const result = await bergetDocumentProcessor.processDocument(
        file,
        documentType,
        updateProgress
      );

      if (!result.success) {
        throw new Error('Document processing failed');
      }

      console.log('Processing completed successfully:', result);

      // Update Supabase with results
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          financial_data: result.financialData,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectError) {
        console.error('Error updating project:', projectError);
      }

      // Update or create generated content
      const { error: contentError } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          script_text: result.scripts.video,
          script_alternatives: result.alternatives as any,
          generation_status: 'completed',
          updated_at: new Date().toISOString()
        });

      if (contentError) {
        console.error('Error updating generated content:', contentError);
      }

      toast({
        title: "Processing Complete!",
        description: `Document processed successfully in ${(result.processingTime / 1000).toFixed(1)}s with EU-compliant AI.`,
      });

      return {
        success: true,
        data: result,
        processingTime: result.processingTime
      };

    } catch (error) {
      console.error('Advanced processing failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      // Update project status to failed
      await supabase
        .from('projects')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsProcessing(false);
    }
  }, [projectId, toast, updateProgress]);

  return {
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress,
    processDocument
  };
};
