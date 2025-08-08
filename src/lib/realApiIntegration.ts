
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

  // Generate podcast using ElevenLabs via Edge Function
  static async generatePodcast(request: PodcastGenerationRequest) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          text: request.scriptText,
          voice: request.voiceId || '9BWtsMINqrJLrRacOk9x', // Default: Aria
          projectId: request.projectId,
          voiceSettings: request.voiceSettings,
        },
      });

      if (error) {
        throw new Error(`Podcast generation failed: ${error.message || 'Unknown error'}`);
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Podcast generation failed');
      }

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        success: true,
        audioUrl,
      };
    } catch (error) {
      console.error('Podcast generation error:', error);
      if (error instanceof Error) throw error;
      throw new Error(`Podcast generation failed: ${String(error)}`);
    }
  }

  // Generate video with graceful demo fallback
  static async generateVideo(request: VideoGenerationRequest) {
    try {
      // If no real avatar is provided, use demo placeholder
      if (!request.avatarId || request.avatarId === 'default') {
        console.warn('No valid avatarId provided. Using demo placeholder video.');
        return {
          success: true,
          videoUrl: '/placeholder.mp4',
          thumbnailUrl: '/placeholder.svg',
          duration: 0,
        };
      }

      // Attempt to use existing edge function that links HeyGen avatar to DB
      const { data, error } = await supabase.functions.invoke('create-heygen-avatar', {
        body: {
          avatarId: request.avatarId,
          // In a real flow this should be a user-provided training video URL. If absent, fallback below will kick in.
          videoUrl: request.backgroundStyle,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Video generation failed');
      }

      return {
        success: true,
        videoUrl: data.preview_video_url || '/placeholder.mp4',
        thumbnailUrl: data.thumbnail_url || '/placeholder.svg',
        duration: data.duration || 0,
      };
    } catch (error) {
      console.warn('Video generation failed, returning placeholder. Details:', error);
      return {
        success: true,
        videoUrl: '/placeholder.mp4',
        thumbnailUrl: '/placeholder.svg',
        duration: 0,
      };
    }
  }

}
