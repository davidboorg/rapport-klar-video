
import { useState } from 'react';
import { elevenLabsClient, VOICE_PRESETS } from '@/integrations/elevenlabs/client';
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
      console.log('Generating podcast with ElevenLabs...', { settings });

      // Generate audio using ElevenLabs
      const { data: audioBlob, error } = await elevenLabsClient.textToSpeech(
        scriptText,
        settings.voiceId,
        {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      );

      if (error || !audioBlob) {
        throw new Error(error?.message || 'Failed to generate audio');
      }

      // Create object URL for the generated audio
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
