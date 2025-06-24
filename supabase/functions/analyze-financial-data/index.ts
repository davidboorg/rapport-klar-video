
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

    // Step 1: Advanced financial data extraction
    console.log('Performing deep financial analysis...');
    
    const deepAnalysisPrompt = `
Du är en expertanalytiker för finansiella rapporter. Analysera denna rapport EXTREMT NOGGRANT och extrahera ALL verklig information. 

VIKTIGT: Detta är en VERKLIG finansiell rapport, inte ett exempel. Du MÅSTE hitta de FAKTISKA siffrorna och företagsinformationen från denna specifika rapport.

Analysera följande rapport och returnera ENDAST giltig JSON med VERKLIGA data från rapporten:

{
  "company_name": "VERKLIGT företagsnamn från rapporten (t.ex. Ericsson, Storytel, etc.)",
  "report_period": "VERKLIG rapportperiod från rapporten (Q1 2024, Q2 2024, H1 2024, etc.)",
  "report_type": "Quarterly/Annual/Interim baserat på rapporten",
  "currency": "Verklig valuta från rapporten (SEK/USD/EUR)",
  "financial_metrics": {
    "revenue": "VERKLIGA intäkter med EXAKTA siffror från rapporten",
    "operating_income": "VERKLIGT rörelseresultat med EXAKTA siffror",
    "net_income": "VERKLIG nettovinst/förlust med EXAKTA siffror", 
    "growth_rate": "VERKLIG tillväxttakt i procent från rapporten",
    "key_figures": "Andra viktiga finansiella nyckeltal med EXAKTA siffror"
  },
  "business_highlights": [
    "VERKLIGA affärshöjdpunkter med SPECIFIKA siffror från rapporten",
    "VERKLIGA produktlanseringar eller avtal med KONKRETA detaljer",
    "FAKTISKA marknadsexpansioner eller förändringar"
  ],
  "challenges_mentioned": [
    "VERKLIGA utmaningar som nämns i rapporten", 
    "SPECIFIKA risker eller problem som diskuteras"
  ],
  "management_outlook": "VERKLIGA kommentarer från ledning eller VD från rapporten",
  "market_context": "VERKLIG marknadssituation som beskrivs",
  "future_guidance": "VERKLIG framtidsguidning från rapporten"
}

ABSOLUT KRITISKT: 
- Läs rapporten ORDENTLIGT och hitta de VERKLIGA siffrorna
- Använd ALDRIG exempel eller generiska siffror
- Om du inte hittar specifik data, skriv "Ej angiven i rapport" 
- Fokusera på att hitta företagsnamnet och rapportperioden först

Här är rapporten som ska analyseras:

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
            content: 'Du är en expertanalytiker som ENDAST arbetar med verkliga finansiella data. Du hittar ALDRIG på siffror. Du extraherar ENDAST faktisk information från de rapporter du får.'
          },
          {
            role: 'user',
            content: deepAnalysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
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
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanedContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name);
    } catch (parseError) {
      console.error('Analysis parsing error:', parseError);
      throw new Error('Could not parse financial analysis as valid JSON');
    }

    // Step 2: Generate two completely different manuscript alternatives using REAL data
    const scriptPrompt = `
Baserat på denna VERKLIGA finansiella analys, skapa EXAKT TVÅ helt olika manusförslag.

VERKLIG FINANSIELL DATA:
${JSON.stringify(extractedData, null, 2)}

Använd de VERKLIGA siffrorna och företagsinformationen ovan för att skapa två unika manus.

Returnera ENDAST denna JSON-struktur:

{
  "script_alternatives": [
    {
      "type": "executive_summary",
      "title": "Kvartalssammanfattning - ${extractedData.company_name}",
      "duration": "2-3 minuter",
      "tone": "Professionell och koncis",
      "target_audience": "Investerare och analytiker",
      "script": "Färdigt manus som börjar: '${extractedData.company_name} presenterade sina resultat för ${extractedData.report_period}...' Använd ALL verklig data inklusive EXAKTA intäkter, vinster och tillväxtsiffror. Nämn specifika produkter och marknader från rapporten. Maximalt 3000 tecken."
    },
    {
      "type": "detailed_analysis", 
      "title": "Fördjupad Analys - ${extractedData.company_name}",
      "duration": "4-5 minuter",
      "tone": "Analytisk och detaljerad",
      "target_audience": "Professionella investerare",
      "script": "Färdigt manus som börjar: 'Vi gräver djupare i ${extractedData.company_name}s senaste kvartalsrapport för ${extractedData.report_period}...' Inkludera ALL finansiella mått, marknadskontext och ledningskommentarer från verkliga rapporten. Använd exakta siffror och procenttal. Maximalt 4500 tecken."
    }
  ]
}

KRITISKT: Manusen måste vara FÄRDIGA att läsa upp och använda ENDAST verkliga data från analysen ovan.
`;

    console.log('Generating specific manuscript alternatives...');

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
            content: `Du skapar professionella podcast-manus baserat på verkliga finansiella rapporter. Du arbetar med ${extractedData.company_name}s rapport för ${extractedData.report_period}. Använd ENDAST verkliga data.`
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

    let parsedScripts = null;
    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        parsedScripts = JSON.parse(cleanedScriptContent);
        
        console.log('Generated script alternatives successfully');
      } catch (scriptParseError) {
        console.error('Script parsing error:', scriptParseError);
      }
    }

    // Save the financial data and scripts
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        financial_data: extractedData,
        status: 'analyzed',
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

    console.log('Analysis completed successfully for:', extractedData.company_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.report_period,
        financial_data: extractedData,
        scripts_generated: parsedScripts ? 'Yes' : 'No',
        message: 'Djup finansiell analys slutförd med verkliga data'
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
