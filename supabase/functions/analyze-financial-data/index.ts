
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, pdfText } = await req.json();
    
    console.log('Starting financial analysis for project:', projectId);
    console.log('PDF text length received:', pdfText?.length || 0);
    console.log('Text preview (first 500 chars):', pdfText?.substring(0, 500) || 'NO CONTENT');

    if (!projectId || !pdfText || pdfText.length < 50) {
      throw new Error('Missing projectId or insufficient PDF content for analysis');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Enhanced financial data extraction with stronger instructions
    console.log('Performing intelligent financial analysis...');
    
    const analysisPrompt = `
Du är en expert finansanalytiker. Analysera denna text från en finansiell rapport MYCKET NOGGRANT.

VIKTIGT: Svara ENDAST med giltig JSON. Ingen annan text före eller efter JSON.

Hitta och extrahera VERKLIG finansiell information från texten. Om du ser "fallback" eller "generisk" text, ignorera den och leta efter RIKTIGA siffror, företagsnamn och finansiell data.

JSON-struktur (fyll i med VERKLIGA data från rapporten):

{
  "company_name": "VERKLIGT företagsnamn från rapporten",
  "report_period": "VERKLIG period som Q1 2024, Q2 2024, etc.",
  "report_type": "Quarterly eller Annual",
  "currency": "SEK, USD, EUR eller valuta som används",
  "financial_metrics": {
    "revenue": "Faktiska intäkter/omsättning med siffror",
    "operating_income": "Verkligt rörelseresultat med siffror", 
    "net_income": "Riktig nettovinst/förlust med siffror",
    "growth_rate": "Faktisk tillväxt i procent",
    "ebitda": "EBITDA om tillgängligt",
    "total_assets": "Totala tillgångar om tillgängligt",
    "equity": "Eget kapital om tillgängligt"
  },
  "business_highlights": [
    "VERKLIGA affärshändelser från rapporten",
    "FAKTISKA produktlanseringar eller avtal"
  ],
  "challenges_mentioned": [
    "RIKTIGA utmaningar som nämns",
    "VERKLIGA risker som diskuteras"
  ],
  "management_outlook": "VERKLIGA ledningskommentarer",
  "market_context": "FAKTISK marknadssituation",
  "future_guidance": "RIKTIG framtidsguidning",
  "data_quality": "high om verklig data hittades, low om mest fallback"
}

SÖK IGENOM TEXTEN efter:
- Siffror med "miljoner", "MSEK", "MEUR", "miljoner kronor"  
- Procentsatser för tillväxt
- Företagsnamn (ofta i början av rapporten)
- Datum och perioder
- Verkliga produktnamn och affärshändelser

Om du INTE hittar verkliga finansiella data, sätt "data_quality": "low" och använd "Ej tillgänglig i extraherad text".

Text att analysera:
${pdfText}
`;

    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du är en finansiell expert som analyserar rapporter och returnerar ENDAST JSON. Hitta verkliga finansiella data, inte generisk text.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI analysis error:', errorText);
      throw new Error(`Financial analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('Financial analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw analysis response preview:', content.substring(0, 500));
      
      // Clean JSON extraction
      let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name || 'Unknown company');
      console.log('Data quality assessment:', extractedData.data_quality || 'unknown');
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', analysisData.choices[0].message.content);
      throw new Error('Failed to parse financial analysis results');
    }

    // Only generate scripts if we have reasonable data quality
    let parsedScripts = null;
    
    if (extractedData.data_quality !== 'low') {
      console.log('Generating professional scripts based on extracted data...');
      
      const scriptPrompt = `
Baserat på denna VERKLIGA finansiella data, skapa professionella manus.

Data: ${JSON.stringify(extractedData, null, 2)}

Returnera ENDAST denna JSON-struktur:

{
  "script_alternatives": [
    {
      "type": "executive_summary",
      "title": "Kvartalssammanfattning - ${extractedData.company_name}",
      "duration": "2-3 minuter",
      "tone": "Professionell och koncis",
      "target_audience": "Investerare och analytiker",
      "script": "Professionellt manus baserat på VERKLIGA siffror och data. Använd specifika siffror från rapporten."
    },
    {
      "type": "detailed_analysis", 
      "title": "Fördjupad Analys - ${extractedData.company_name}",
      "duration": "4-5 minuter",
      "tone": "Analytisk och detaljerad",
      "target_audience": "Professionella investerare",
      "script": "Djupgående analys med VERKLIGA finansiella nyckeltal och trender."
    }
  ]
}
`;

      const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Skapa professionella manus baserat på verkliga finansiella data. Svara ENDAST med JSON.'
            },
            {
              role: 'user',
              content: scriptPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 4000
        }),
      });

      if (scriptResponse.ok) {
        const scriptData = await scriptResponse.json();
        
        try {
          let scriptContent = scriptData.choices[0].message.content.trim();
          scriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
          
          const jsonStart = scriptContent.indexOf('{');
          const jsonEnd = scriptContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            scriptContent = scriptContent.substring(jsonStart, jsonEnd);
          }
          
          parsedScripts = JSON.parse(scriptContent);
          console.log('Generated professional scripts successfully');
          
        } catch (scriptParseError) {
          console.error('Script parsing error:', scriptParseError);
          parsedScripts = null;
        }
      }
    } else {
      console.log('Low data quality detected, skipping script generation');
    }

    // Save the financial data
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        financial_data: extractedData,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
    }

    if (parsedScripts?.script_alternatives) {
      const { error: contentError } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          script_alternatives: parsedScripts.script_alternatives,
          script_text: parsedScripts.script_alternatives[0]?.script || '',
          generation_status: 'completed',
          updated_at: new Date().toISOString(),
        });

      if (contentError) {
        console.error('Error saving scripts:', contentError);
      }
    }

    console.log('Analysis completed for:', extractedData.company_name);
    console.log('Data quality:', extractedData.data_quality);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.report_period,
        data_quality: extractedData.data_quality,
        financial_data: extractedData,
        scripts_generated: parsedScripts ? 'Yes' : 'No',
        message: 'Förbättrad finansiell analys med verklig dataextraktion'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in financial analysis function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred during financial analysis'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
