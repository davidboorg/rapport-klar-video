
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
  // Generate script using OpenAI with better error handling
  static async generateScript(request: ScriptGenerationRequest) {
    try {
      console.log('Calling analyze-financial-data with request:', request);
      
      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: {
          projectId: request.projectId,
          pdfText: request.extractedText,
          documentType: request.documentType,
          targetAudience: request.targetAudience
        }
      });

      console.log('Response from analyze-financial-data:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Script generation failed: ${error.message || 'Unknown error'}`);
      }
      
      if (!data?.success) {
        console.error('API returned failure:', data);
        const errorMsg = data?.error || 'Unknown error from AI service';
        
        // Handle specific error types
        if (errorMsg.includes('429')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again in a few minutes.');
        } else if (errorMsg.includes('401')) {
          throw new Error('OpenAI API key is invalid or missing. Please check your configuration.');
        } else if (errorMsg.includes('quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your billing settings.');
        } else {
          throw new Error(`Script generation failed: ${errorMsg}`);
        }
      }

      return {
        success: true,
        script: data.script_text,
        alternatives: data.script_alternatives || [],
        financialData: data.financial_data
      };
    } catch (error) {
      console.error('Script generation error details:', error);
      
      // Re-throw with more context if it's not already a detailed error
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Script generation failed: ${String(error)}`);
      }
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
