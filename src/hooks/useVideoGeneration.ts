
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VideoGenerationJob {
  id: string;
  project_id: string;
  template_id: string;
  brand_config: {
    company_name: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
  };
  status: 'queued' | 'processing' | 'rendering' | 'completed' | 'failed';
  progress: number;
  video_url?: string;
  error_message?: string;
  created_at: string;
}

export const useVideoGeneration = () => {
  const [jobs, setJobs] = useState<VideoGenerationJob[]>([]);
  const [isGenerating, setGenerating] = useState(false);
  const { toast } = useToast();

  const simulateVideoGeneration = async (
    projectId: string, 
    templateId: string, 
    brandConfig: VideoGenerationJob['brand_config'],
    scriptText: string
  ): Promise<string> => {
    const jobId = `job_${Date.now()}`;
    
    const newJob: VideoGenerationJob = {
      id: jobId,
      project_id: projectId,
      template_id: templateId,
      brand_config: brandConfig,
      status: 'queued',
      progress: 0,
      created_at: new Date().toISOString()
    };

    setJobs(prev => [...prev, newJob]);

    // Simulera progresssteg
    const progressSteps = [
      { status: 'processing' as const, progress: 25, message: 'Förbereder script...' },
      { status: 'rendering' as const, progress: 50, message: 'Genererar AI-avatar...' },
      { status: 'rendering' as const, progress: 75, message: 'Renderar video...' },
      { status: 'completed' as const, progress: 100, message: 'Video klar!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: step.status, progress: step.progress }
          : job
      ));

      toast({
        title: step.message,
        description: `${step.progress}% klart`,
      });
    }

    // Använd placeholder video URL
    const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
    
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, video_url: videoUrl }
        : job
    ));

    return videoUrl;
  };

  const generateVideo = async (
    projectId: string,
    templateId: string,
    brandConfig: VideoGenerationJob['brand_config'],
    scriptText: string
  ) => {
    setGenerating(true);
    try {
      const videoUrl = await simulateVideoGeneration(projectId, templateId, brandConfig, scriptText);
      
      // Uppdatera projektet med video URL
      const { error } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          video_url: videoUrl,
          generation_status: 'completed',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Video genererad!",
        description: "Din AI-video är redo för visning och nedladdning.",
      });

      return videoUrl;
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Fel",
        description: "Kunde inte generera video. Försök igen.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const getJobProgress = (projectId: string) => {
    return jobs.find(job => job.project_id === projectId);
  };

  return {
    jobs,
    isGenerating,
    generateVideo,
    getJobProgress
  };
};
