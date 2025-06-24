
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
    const { action, payload } = await req.json();
    
    // Try multiple possible secret names for Berget API key
    const bergetApiKey = Deno.env.get('BERGET_API_KEY') || 
                        Deno.env.get('BERGET_API_KEY_NEW') ||
                        Deno.env.get('BERGET_KEY');
    
    if (!bergetApiKey) {
      console.error('Berget API key not found in any of the expected environment variables');
      throw new Error('Berget API key not configured. Try BERGET_API_KEY_NEW or BERGET_KEY');
    }

    const bergetApiUrl = "https://api.berget.ai/v1";
    
    console.log(`Processing Berget API request - Action: ${action}`);

    let endpoint = '';
    let method = 'GET';
    let body = null;

    // Route different actions to appropriate Berget API endpoints
    switch (action) {
      case 'getAvatars':
        endpoint = '/avatars';
        method = 'GET';
        break;
      
      case 'createAvatar':
        endpoint = '/avatars';
        method = 'POST';
        body = payload;
        break;
      
      case 'updateAvatar':
        endpoint = `/avatars/${payload.avatarId}`;
        method = 'PUT';
        body = { status: payload.status };
        break;
      
      case 'deleteAvatar':
        endpoint = `/avatars/${payload.avatarId}`;
        method = 'DELETE';
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bergetApiKey}`,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    console.log(`Making request to Berget API: ${method} ${endpoint}`);

    const response = await fetch(`${bergetApiUrl}${endpoint}`, requestOptions);
    
    console.log(`Berget API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Berget API error: ${errorText}`);
      
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

    const data = await response.json();
    console.log('Berget API request successful');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Berget API proxy error:', error);
    
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
