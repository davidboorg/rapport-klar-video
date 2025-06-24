
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PodcastSettings {
  voiceId: string;
  speed: number;
  targetLength: 'short' | 'medium' | 'long';
}

export const usePodcastGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePodcast = async (
    scriptText: string,
    settings: PodcastSettings
  ): Promise<string | null> => {
    if (!scriptText.trim()) {
      toast({
        title: "No Script",
        description: "Please provide a script to generate the podcast",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      console.log('Generating podcast with ElevenLabs via Supabase Function...', { settings });

      // Generate audio using Supabase Function
      const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-podcast', {
        body: {
          text: scriptText,
          voice: settings.voiceId,
          projectId: `podcast_${Date.now()}`
        }
      });

      if (audioError) {
        throw new Error(`Podcast generation failed: ${audioError.message}`);
      }

      if (!audioData?.success) {
        throw new Error(`Podcast error: ${audioData?.error || 'Unknown error'}`);
      }

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(audioData.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setGeneratedAudioUrl(audioUrl);

      toast({
        title: "Podcast Generated!",
        description: "Your podcast is ready to listen to",
      });

      return audioUrl;
    } catch (error) {
      console.error('Podcast generation failed:', error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate podcast: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPodcast = (audioUrl: string, fileName: string = 'podcast.mp3') => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    isGenerating,
    generatedAudioUrl,
    generatePodcast,
    downloadPodcast,
    setGeneratedAudioUrl
  };
};
