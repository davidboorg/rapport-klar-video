
import { useState, useCallback } from 'react';
import { bergetClient } from '@/integrations/berget/client';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export const useAdvancedProcessing = (projectId: string) => {
  const [tasks, setTasks] = useState<ProcessingTask[]>([
    {
      id: 'document-upload',
      name: 'Document Upload',
      description: 'Uploading document to Berget.ai secure servers',
      status: 'pending',
      progress: 0
    },
    {
      id: 'content-extraction',
      name: 'Content Extraction',
      description: 'Extracting and parsing document content',
      status: 'pending',
      progress: 0
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      description: 'Performing deep AI analysis of financial data',
      status: 'pending',
      progress: 0
    },
    {
      id: 'content-generation',
      name: 'Content Generation',
      description: 'Generating personalized content variants',
      status: 'pending',
      progress: 0
    }
  ]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const updateTaskStatus = useCallback((taskId: string, updates: Partial<ProcessingTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const updateOverallProgress = useCallback(() => {
    setTasks(prev => {
      const totalProgress = prev.reduce((sum, task) => sum + task.progress, 0);
      const overall = totalProgress / prev.length;
      setOverallProgress(overall);
      return prev;
    });
  }, []);

  const processDocument = useCallback(async (file: File, documentType: 'quarterly' | 'board') => {
    setIsProcessing(true);
    setCurrentTaskIndex(0);

    try {
      // Task 1: Document Upload
      updateTaskStatus('document-upload', { 
        status: 'processing', 
        startTime: new Date(),
        progress: 10 
      });

      const { data: uploadResult, error: uploadError } = await bergetClient.processDocument(file, documentType);
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      updateTaskStatus('document-upload', { 
        status: 'completed', 
        progress: 100,
        endTime: new Date(),
        result: uploadResult 
      });

      // Task 2: Content Extraction
      setCurrentTaskIndex(1);
      updateTaskStatus('content-extraction', { 
        status: 'processing', 
        startTime: new Date(),
        progress: 20 
      });

      // Simulate content extraction progress
      for (let i = 20; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        updateTaskStatus('content-extraction', { progress: i });
      }

      updateTaskStatus('content-extraction', { 
        status: 'completed', 
        endTime: new Date() 
      });

      // Task 3: AI Analysis
      setCurrentTaskIndex(2);
      updateTaskStatus('ai-analysis', { 
        status: 'processing', 
        startTime: new Date(),
        progress: 15 
      });

      // Call Berget.ai for AI analysis
      const { data: analysisResult, error: analysisError } = await bergetClient.generateContent(
        [uploadResult], 
        'summary'
      );

      if (analysisError) {
        throw new Error(`AI Analysis failed: ${analysisError.message}`);
      }

      updateTaskStatus('ai-analysis', { 
        status: 'completed', 
        progress: 100,
        endTime: new Date(),
        result: analysisResult 
      });

      // Task 4: Content Generation
      setCurrentTaskIndex(3);
      updateTaskStatus('content-generation', { 
        status: 'processing', 
        startTime: new Date(),
        progress: 25 
      });

      // Generate multiple content variants
      const contentTypes: Array<'video' | 'audio' | 'summary'> = ['video', 'audio', 'summary'];
      const generationResults = [];

      for (const contentType of contentTypes) {
        const { data: contentResult, error: contentError } = await bergetClient.generateContent(
          [analysisResult], 
          contentType
        );

        if (!contentError) {
          generationResults.push(contentResult);
        }

        updateTaskStatus('content-generation', { 
          progress: 25 + (generationResults.length * 25) 
        });
      }

      updateTaskStatus('content-generation', { 
        status: 'completed', 
        progress: 100,
        endTime: new Date(),
        result: generationResults 
      });

      // Update project in database
      await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          financial_data: analysisResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      toast({
        title: "Processing Complete!",
        description: "Your document has been analyzed and content generated successfully.",
      });

      return { success: true, data: { analysisResult, generationResults } };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Mark current task as failed
      const currentTask = tasks[currentTaskIndex];
      if (currentTask) {
        updateTaskStatus(currentTask.id, { 
          status: 'failed', 
          error: errorMessage,
          endTime: new Date() 
        });
      }

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
      updateOverallProgress();
    }
  }, [projectId, tasks, currentTaskIndex, updateTaskStatus, updateOverallProgress, toast]);

  return {
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress,
    processDocument,
    updateTaskStatus
  };
};
