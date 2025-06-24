
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { endpoint, method = 'GET', body, headers = {} } = await req.json();
    
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const elevenLabsApiUrl = "https://api.elevenlabs.io/v1";
    
    console.log(`Proxying ${method} request to ElevenLabs API: ${endpoint}`);

    const requestHeaders = {
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${elevenLabsApiUrl}${endpoint}`, requestOptions);
    
    console.log(`ElevenLabs API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: errorText || 'Request failed', 
          status: response.status 
        }), 
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle audio responses differently
    if (endpoint.includes('/text-to-speech/')) {
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      
      return new Response(JSON.stringify({ audio: base64Audio }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('ElevenLabs API request successful');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ElevenLabs API proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
