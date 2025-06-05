
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialData {
  revenue?: string;
  ebitda?: string;
  growth_percentage?: string;
  key_highlights?: string[];
  period?: string;
  company_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, projectId } = await req.json();
    
    if (!pdfText || !projectId) {
      throw new Error('PDF text and project ID are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing financial data for project:', projectId);

    // Extract financial data using GPT-4
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du är en expert på finansiell analys. Extrahera följande information från finansiella rapporter på svenska:
            - Företagsnamn
            - Rapportperiod (kvartal/år)
            - Intäkter/omsättning
            - EBITDA
            - Tillväxtprocent
            - 3-5 viktiga höjdpunkter/prestationer
            
            Svara endast med valid JSON i detta format:
            {
              "company_name": "string",
              "period": "string", 
              "revenue": "string",
              "ebitda": "string",
              "growth_percentage": "string",
              "key_highlights": ["string", "string", "string"]
            }`
          },
          {
            role: 'user',
            content: `Analysera denna finansiella rapport och extrahera nyckelinformation:\n\n${pdfText.substring(0, 4000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!extractionResponse.ok) {
      const error = await extractionResponse.text();
      console.error('OpenAI extraction error:', error);
      throw new Error(`OpenAI API error: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    let financialData: FinancialData;
    
    try {
      financialData = JSON.parse(extractionData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse financial data:', parseError);
      throw new Error('Failed to extract structured financial data');
    }

    console.log('Extracted financial data:', financialData);

    // Generate video script using GPT-4
    const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du är en expert på att skriva engagerande videomanus för företagsrapporter på svenska. 
            Skapa ett 2-3 minuters videomanus med denna struktur:
            
            1. INTRO (30 sekunder): Välkomnande och presentation av rapporten
            2. HÖJDPUNKTER (90 sekunder): Viktiga finansiella prestationer och nyckeltal
            3. FRAMTIDSUTSIKTER (30 sekunder): Framåtblickande uttalanden och mål
            
            Använd ett professionellt men tillgängligt språk. Inkludera konkreta siffror och procentsatser.
            Gör manuset engagerande och lätt att följa.`
          },
          {
            role: 'user',
            content: `Skapa ett videomanus baserat på denna finansiella data:
            
            Företag: ${financialData.company_name || 'Företaget'}
            Period: ${financialData.period || 'senaste perioden'}
            Intäkter: ${financialData.revenue || 'N/A'}
            EBITDA: ${financialData.ebitda || 'N/A'}
            Tillväxt: ${financialData.growth_percentage || 'N/A'}
            Höjdpunkter: ${financialData.key_highlights?.join(', ') || 'N/A'}
            
            Gör manuset cirka 250-300 ord för 2-3 minuters video.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!scriptResponse.ok) {
      const error = await scriptResponse.text();
      console.error('OpenAI script generation error:', error);
      throw new Error(`OpenAI API error: ${scriptResponse.status}`);
    }

    const scriptData = await scriptResponse.json();
    const generatedScript = scriptData.choices[0].message.content;

    console.log('Generated script length:', generatedScript.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update project with financial data and generated script
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        financial_data: financialData,
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save financial data');
    }

    // Create generated content record
    const { error: contentError } = await supabase
      .from('generated_content')
      .insert({
        project_id: projectId,
        script_text: generatedScript,
        generation_status: 'completed',
      });

    if (contentError) {
      console.error('Content creation error:', contentError);
      throw new Error('Failed to save generated script');
    }

    console.log('Successfully processed financial data and generated script');

    return new Response(JSON.stringify({
      success: true,
      financial_data: financialData,
      script: generatedScript,
      estimated_duration: Math.ceil(generatedScript.split(' ').length / 150) // ~150 words per minute
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-financial-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
