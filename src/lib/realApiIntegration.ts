
import { supabase } from '@/integrations/supabase/client';

export interface ScriptGenerationRequest {
  projectId: string;
  extractedText: string;
  documentType: 'quarterly' | 'board' | 'annual';
  targetAudience: 'investors' | 'board' | 'public';
}

export interface PodcastGenerationRequest {
  projectId: string;
  scriptText: string;
  voiceId?: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
  };
}

export interface VideoGenerationRequest {
  projectId: string;
  scriptText: string;
  avatarId?: string;
  backgroundStyle?: string;
}

export class RealApiIntegration {
  // Generate script using OpenAI
  static async generateScript(request: ScriptGenerationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: request.projectId,
          pdfText: request.extractedText,
          documentType: request.documentType,
          targetAudience: request.targetAudience
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Script generation failed');

      return {
        success: true,
        script: data.script_text,
        alternatives: data.script_alternatives || [],
        financialData: data.financial_data
      };
    } catch (error) {
      console.error('Script generation error:', error);
      throw error;
    }
  }

  // Generate podcast using ElevenLabs
  static async generatePodcast(request: PodcastGenerationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-proxy', {
        body: {
          text: request.scriptText,
          voice_id: request.voiceId || 'EXAVITQu4vr4xnSDxMaL', // Default Sarah voice
          model_id: 'eleven_multilingual_v2',
          voice_settings: request.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Podcast generation failed');

      return {
        success: true,
        audioUrl: data.audio_url,
        duration: data.duration
      };
    } catch (error) {
      console.error('Podcast generation error:', error);
      throw error;
    }
  }

  // Generate video using HeyGen
  static async generateVideo(request: VideoGenerationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('create-heygen-avatar', {
        body: {
          script: request.scriptText,
          avatar_id: request.avatarId || 'default',
          background_style: request.backgroundStyle || 'professional'
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Video generation failed');

      return {
        success: true,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw error;
    }
  }
}
