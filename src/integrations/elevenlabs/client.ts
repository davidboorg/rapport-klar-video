
// ElevenLabs API client for text-to-speech functionality
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export interface ElevenLabsSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

class ElevenLabsClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<{ data: any; error: any }> {
    try {
      // Use Supabase Edge Function for secure API calls to ElevenLabs
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-proxy', {
        body: {
          endpoint,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined,
          headers: options.headers
        }
      });

      if (error) {
        console.error('ElevenLabs API proxy error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('ElevenLabs request failed:', error);
      return { data: null, error: { message: 'Network error', originalError: error } };
    }
  }

  // Get available voices
  async getVoices(): Promise<{ data: ElevenLabsVoice[] | null; error: any }> {
    return this.makeRequest('/voices');
  }

  // Generate speech from text
  async textToSpeech(
    text: string, 
    voiceId: string = '9BWtsMINqrJLrRacOk9x', // Aria voice as default
    settings: ElevenLabsSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }
  ): Promise<{ data: Blob | null; error: any }> {
    try {
      const result = await this.makeRequest(`/text-to-speech/${voiceId}`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings
        }),
      });

      if (result.error) {
        return { data: null, error: result.error };
      }

      // Convert base64 audio back to blob
      if (result.data?.audio) {
        const audioBuffer = Uint8Array.from(atob(result.data.audio), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        return { data: audioBlob, error: null };
      }

      return { data: null, error: { message: 'No audio data received' } };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generate speech with multiple voices (for conversation-style content)
  async generateConversation(
    segments: { text: string; voiceId: string; speaker: string }[]
  ): Promise<{ data: Blob | null; error: any }> {
    try {
      const audioSegments: Blob[] = [];

      for (const segment of segments) {
        const { data: audioBlob, error } = await this.textToSpeech(
          segment.text, 
          segment.voiceId
        );

        if (error || !audioBlob) {
          return { data: null, error: error || { message: 'Failed to generate audio segment' } };
        }

        audioSegments.push(audioBlob);
      }

      // For now, return the first segment - in a real implementation you'd concatenate
      return { data: audioSegments[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Default voice configurations for different use cases
export const VOICE_PRESETS = {
  professional_male: '9BWtsMINqrJLrRacOk9x', // Aria
  professional_female: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  executive_male: 'JBFqnCBsd6RMkjVDRZzb', // George
  analyst_female: 'cgSgspJ2msm6clMCkdW9', // Jessica
  narrator: 'TX3LPaxmHKxFdv7VOQHJ', // Liam
  conversational: 'XB0fDUnXU5powFXDhCwa' // Charlotte
};

export const elevenLabsClient = new ElevenLabsClient();
