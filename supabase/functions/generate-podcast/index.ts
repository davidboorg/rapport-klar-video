
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = '9BWtsMINqrJLrRacOk9x', projectId, voiceSettings } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Text är required för podcast-generering' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Try multiple possible secret names for ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY') || 
                            Deno.env.get('ELEVENLABS_API_KEY_NEW') ||
                            Deno.env.get('ELEVENLABS_KEY');
    
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not found in any of the expected environment variables');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ElevenLabs API key not configured. Kontakta support.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generating podcast for project ${projectId} with voice ${voice}`);

    // Prepare voice settings with defaults
    const defaultVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };

    const finalVoiceSettings = { ...defaultVoiceSettings, ...voiceSettings };

    // Call ElevenLabs API for text-to-speech
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: finalVoiceSettings
      }),
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `ElevenLabs API fel: ${errorText}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Receive audio as ArrayBuffer
    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer();

    // Upload to Supabase Storage (private bucket)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const safeProjectId = projectId || 'misc';
    const objectPath = `${safeProjectId}/${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('generated-audio')
      .upload(objectPath, audioArrayBuffer, { contentType: 'audio/mpeg' });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a signed URL valid for 24 hours
    const { data: signed, error: signedError } = await supabase.storage
      .from('generated-audio')
      .createSignedUrl(objectPath, 60 * 60 * 24);

    if (signedError || !signed?.signedUrl) {
      console.error('Signed URL error:', signedError);
      return new Response(
        JSON.stringify({ success: false, error: `Signed URL failed: ${signedError?.message || 'Unknown'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Podcast generated and stored at ${objectPath}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        audioUrl: signed.signedUrl,
        path: objectPath,
        projectId: safeProjectId,
        voiceSettings: finalVoiceSettings
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-podcast function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
