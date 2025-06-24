
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProcessingTask {
  id: string;
  title: string;
  name: string; // Add name property for display
  status: 'pending' | 'processing' | 'completed' | 'error' | 'failed';
  progress: number;
  description: string;
  details?: string; // Add optional details property for error messages
}

export const useAdvancedProcessing = (projectId: string) => {
  const [tasks, setTasks] = useState<ProcessingTask[]>([
    {
      id: 'upload',
      title: 'Uploading Document',
      name: 'Uploading Document',
      status: 'pending',
      progress: 0,
      description: 'Säker uppladdning till EU-baserad server'
    },
    {
      id: 'extract',
      title: 'Extracting Content',
      name: 'Extracting Content',
      status: 'pending',
      progress: 0,
      description: 'Intelligent textextraktion med OCR'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      name: 'AI Analysis',
      status: 'pending',
      progress: 0,
      description: 'Finansiell analys med OpenAI GPT-4'
    },
    {
      id: 'generate',
      title: 'Generating Scripts',
      name: 'Generating Scripts',
      status: 'pending',
      progress: 0,
      description: 'Skapar anpassade manuscriptförslag'
    }
  ]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const updateTaskStatus = (taskId: string, status: ProcessingTask['status'], progress: number = 0) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status, progress } : task
    ));
  };

  const updateTaskError = (taskId: string, errorMessage: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'error', details: errorMessage } : task
    ));
  };

  const calculateOverallProgress = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const progress = (completedTasks / totalTasks) * 100;
    setOverallProgress(progress);
    return progress;
  };

  const processDocument = async (file: File, documentType: 'quarterly' | 'board') => {
    setIsProcessing(true);
    setCurrentTaskIndex(0);

    try {
      // Task 1: Upload document
      updateTaskStatus('upload', 'processing', 25);
      
      const fileName = `${projectId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        updateTaskError('upload', `Upload failed: ${uploadError.message}`);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      updateTaskStatus('upload', 'completed', 100);
      setCurrentTaskIndex(1);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Update project with PDF URL
      await supabase
        .from('projects')
        .update({ 
          pdf_url: publicUrl,
          status: 'processing' 
        })
        .eq('id', projectId);

      // Task 2: Extract content
      updateTaskStatus('extract', 'processing', 30);

      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-pdf-content', {
        body: {
          pdfUrl: publicUrl,
          projectId: projectId
        }
      });

      if (extractionError || !extractionData?.success) {
        const errorMsg = extractionError?.message || extractionData?.error || 'PDF extraction failed';
        updateTaskError('extract', errorMsg);
        throw new Error(errorMsg);
      }

      updateTaskStatus('extract', 'completed', 100);
      setCurrentTaskIndex(2);

      // Task 3: AI Analysis with OpenAI
      updateTaskStatus('analyze', 'processing', 40);

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: projectId,
          pdfText: extractionData.content
        }
      });

      if (analysisError || !analysisData?.success) {
        const errorMsg = analysisError?.message || analysisData?.error || 'AI analysis failed';
        updateTaskError('analyze', errorMsg);
        throw new Error(errorMsg);
      }

      updateTaskStatus('analyze', 'completed', 100);
      setCurrentTaskIndex(3);

      // Task 4: Generate scripts (already done in analyze-financial-data)
      updateTaskStatus('generate', 'processing', 80);
      
      // Small delay to show the generation step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateTaskStatus('generate', 'completed', 100);

      // Update project status
      await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', projectId);

      calculateOverallProgress();

      toast({
        title: "Processing Complete!",
        description: "Your document has been analyzed and scripts generated successfully.",
      });

      return { success: true, data: analysisData };

    } catch (error) {
      console.error('Processing error:', error);
      
      // Mark current task as error
      if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
        const taskId = tasks[currentTaskIndex].id;
        updateTaskError(taskId, error instanceof Error ? error.message : 'Unknown error');
      }

      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    tasks,
    currentTaskIndex,
    isProcessing,
    overallProgress,
    processDocument
  };
};
