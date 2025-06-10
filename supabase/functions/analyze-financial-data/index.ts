
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
  net_income?: string;
  cash_flow?: string;
  growth_percentage?: string;
  quarter_over_quarter?: string;
  key_highlights?: string[];
  period?: string;
  company_name?: string;
  currency?: string;
  report_type?: string;
  ceo_quote?: string;
  forward_guidance?: string;
  segment_performance?: string[];
  geographic_breakdown?: string[];
  concerns?: string[];
}

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
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

    console.log('Starting intelligent financial analysis for project:', projectId);

    // STEP 1: Extract comprehensive financial data
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
            content: `Du är en expert på finansiell analys. Extrahera följande information från finansiella rapporter:
            
            NYCKELDATA:
            - Företagsnamn och rapportperiod (Q1, Q2, Q3, Q4, H1, Helår)
            - Intäkter/omsättning med valuta
            - EBITDA, nettovinst, kassaflöde
            - Tillväxtprocent (år-över-år och kvartal-över-kvartal)
            - Segmentprestanda och geografisk fördelning
            
            KVALITATIV ANALYS:
            - 5-7 viktiga höjdpunkter/prestationer
            - VD-citat eller framåtblickande uttalanden
            - Framtidsutsikter och guidning
            - Potentiella problem eller utmaningar
            
            Svara med valid JSON i detta format:
            {
              "company_name": "string",
              "period": "string",
              "report_type": "Q1|Q2|Q3|Q4|H1|Annual",
              "currency": "SEK|USD|EUR",
              "revenue": "string med siffror och valuta",
              "ebitda": "string",
              "net_income": "string", 
              "cash_flow": "string",
              "growth_percentage": "string",
              "quarter_over_quarter": "string",
              "key_highlights": ["string", "string", "string"],
              "ceo_quote": "string",
              "forward_guidance": "string",
              "segment_performance": ["string", "string"],
              "geographic_breakdown": ["string", "string"],
              "concerns": ["string", "string"]
            }`
          },
          {
            role: 'user',
            content: `Analysera denna finansiella rapport och extrahera all nyckelinformation:\n\n${pdfText.substring(0, 6000)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!extractionResponse.ok) {
      throw new Error(`OpenAI extraction error: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    let financialData: FinancialData;
    
    try {
      financialData = JSON.parse(extractionData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse financial data:', parseError);
      throw new Error('Failed to extract structured financial data');
    }

    console.log('Extracted comprehensive financial data:', financialData);

    // STEP 2: Generate three script alternatives
    const scriptGenerationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Du är expert på att skriva engagerande videomanus för företagsrapporter. 
            Skapa TRE olika script-alternativ baserat på finansiell data:

            1. EXECUTIVE SUMMARY (2 minuter, ~300 ord):
            - Professionell ton, högnivå-höjdpunkter
            - Fokus på övergripande prestanda
            - Struktur: Välkomst → Nyckelresultat → Framtidsutsikter

            2. INVESTOR FOCUS (3 minuter, ~450 ord):
            - Detaljerad finansiell analys
            - Djupare diskussion av segment och tillväxt
            - Struktur: Intro → Finansiella höjdpunkter → Segmentanalys → Guidning

            3. SOCIAL MEDIA VERSION (60 sekunder, ~150 ord):
            - Dynamisk, engagerande ton
            - Fokus på de mest imponerande siffrorna
            - Struktur: Hook → Nyckelresultat → Framåtblick

            Alla script ska:
            - Börja med: "Jag är [Namn] och presenterar [Företag]s [Period] resultat"
            - Inkludera konkreta siffror och procentsatser
            - Avsluta professionellt
            - Vara på svenska
            
            Svara med valid JSON:
            {
              "scripts": [
                {
                  "type": "executive",
                  "title": "Executive Summary",
                  "duration": "2 minuter",
                  "script": "fullständigt manus",
                  "tone": "Professionell",
                  "key_points": ["punkt1", "punkt2", "punkt3"]
                },
                {
                  "type": "investor", 
                  "title": "Investor Focus",
                  "duration": "3 minuter",
                  "script": "fullständigt manus",
                  "tone": "Analytisk",
                  "key_points": ["punkt1", "punkt2", "punkt3"]
                },
                {
                  "type": "social",
                  "title": "Social Media",
                  "duration": "60 sekunder", 
                  "script": "fullständigt manus",
                  "tone": "Dynamisk",
                  "key_points": ["punkt1", "punkt2", "punkt3"]
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Skapa tre script-alternativ baserat på denna finansiella data:
            
            Företag: ${financialData.company_name || 'Företaget'}
            Period: ${financialData.period || 'senaste perioden'}
            Typ: ${financialData.report_type || 'rapport'}
            Intäkter: ${financialData.revenue || 'N/A'}
            EBITDA: ${financialData.ebitda || 'N/A'}
            Tillväxt: ${financialData.growth_percentage || 'N/A'}
            Höjdpunkter: ${financialData.key_highlights?.join(', ') || 'N/A'}
            VD-citat: ${financialData.ceo_quote || 'N/A'}
            Framtidsutsikter: ${financialData.forward_guidance || 'N/A'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!scriptGenerationResponse.ok) {
      throw new Error(`Script generation error: ${scriptGenerationResponse.status}`);
    }

    const scriptData = await scriptGenerationResponse.json();
    let scriptAlternatives: { scripts: ScriptAlternative[] };
    
    try {
      scriptAlternatives = JSON.parse(scriptData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse script alternatives:', parseError);
      throw new Error('Failed to generate script alternatives');
    }

    console.log('Generated script alternatives:', scriptAlternatives.scripts.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update project with comprehensive financial data
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

    // Save all script alternatives
    const { error: contentError } = await supabase
      .from('generated_content')
      .upsert({
        project_id: projectId,
        script_text: scriptAlternatives.scripts[0].script, // Default to executive
        script_alternatives: scriptAlternatives.scripts,
        generation_status: 'completed',
        updated_at: new Date().toISOString(),
      });

    if (contentError) {
      console.error('Content creation error:', contentError);
      throw new Error('Failed to save generated scripts');
    }

    console.log('Successfully processed financial data and generated script alternatives');

    return new Response(JSON.stringify({
      success: true,
      financial_data: financialData,
      script_alternatives: scriptAlternatives.scripts,
      processing_steps: [
        'PDF analyserad och nyckeldata extraherad',
        'Finansiella mätvärden identifierade',
        'Tre script-alternativ genererade',
        'Innehåll sparat och redo för anpassning'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in intelligent financial analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
