
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
    
    // Get the API key from the configured secret
    const bergetApiKey = Deno.env.get('BERGET_API_KEY');
    
    if (!bergetApiKey) {
      console.error('No Berget API key found in environment variables');
      throw new Error('BERGET_API_KEY not configured');
    }

    const bergetApiUrl = "https://api.berget.ai/v1";
    
    console.log(`Proxying ${method} request to Berget API: ${endpoint}`);

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bergetApiKey}`,
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

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
