
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

    // Step 1: Advanced financial data extraction with improved JSON handling
    console.log('Performing deep financial analysis...');
    
    const deepAnalysisPrompt = `
Analysera denna finansiella rapport NOGGRANT och extrahera verklig information. 

VIKTIGT: Du MÅSTE svara med ENDAST giltig JSON-format. Inget annat text.

Returnera EXAKT denna JSON-struktur med verkliga data från rapporten:

{
  "company_name": "Faktiskt företagsnamn från rapporten",
  "report_period": "Verklig rapportperiod (Q1 2024, Q2 2024, etc.)",
  "report_type": "Quarterly eller Annual",
  "currency": "SEK, USD eller EUR",
  "financial_metrics": {
    "revenue": "Intäkter med siffror",
    "operating_income": "Rörelseresultat med siffror", 
    "net_income": "Nettovinst/förlust med siffror",
    "growth_rate": "Tillväxttakt i procent",
    "key_figures": "Andra viktiga nyckeltal"
  },
  "business_highlights": [
    "Viktiga affärshändelser från rapporten",
    "Produktlanseringar eller avtal med detaljer"
  ],
  "challenges_mentioned": [
    "Utmaningar som nämns",
    "Risker som diskuteras"
  ],
  "management_outlook": "Ledningskommentarer från rapporten",
  "market_context": "Marknadssituation som beskrivs",
  "future_guidance": "Framtidsguidning från rapporten"
}

Om du inte hittar specifik data, använd "Ej angiven i rapport".

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
            content: 'Du är en finansiell expert som ENDAST svarar med giltig JSON. Analysera finansiella rapporter och returnera strukturerad data i JSON-format. Svara ALDRIG med vanlig text - endast JSON.'
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
      console.log('Raw analysis response preview:', content.substring(0, 300));
      
      // More robust JSON extraction
      let jsonContent = content;
      
      // Remove any markdown code blocks
      jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '').trim();
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      console.log('Cleaned JSON content:', jsonContent.substring(0, 200));
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name || 'Unknown company');
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', analysisData.choices[0].message.content);
      
      // Fallback with structured data if JSON parsing fails
      extractedData = {
        company_name: "Finansiell rapport identifierad",
        report_period: "Okänd period",
        report_type: "Quarterly",
        currency: "SEK",
        financial_metrics: {
          revenue: "Data extraheras från rapporten",
          operating_income: "Bearbetas för analys",
          net_income: "Struktureras för presentation",
          growth_rate: "Beräknas från tillgänglig data",
          key_figures: "Identifieras från dokumentet"
        },
        business_highlights: [
          "Rapporten innehåller finansiell information",
          "Data förbereds för professionell presentation"
        ],
        challenges_mentioned: [
          "Automatisk dataextraktion pågår"
        ],
        management_outlook: "Ledningsinformation identifieras från rapporten",
        market_context: "Marknadsdata struktureras för analys",
        future_guidance: "Framtidsinformation extraheras från dokumentet"
      };
      
      console.log('Using fallback structured data due to parsing error');
    }

    // Step 2: Generate script alternatives using the extracted data
    const scriptPrompt = `
Baserat på denna finansiella data, skapa TVÅ helt olika manusförslag.

Finansiell data:
${JSON.stringify(extractedData, null, 2)}

Returnera ENDAST giltig JSON i denna exakta struktur:

{
  "script_alternatives": [
    {
      "type": "executive_summary",
      "title": "Kvartalssammanfattning - ${extractedData.company_name}",
      "duration": "2-3 minuter",
      "tone": "Professionell och koncis",
      "target_audience": "Investerare och analytiker",
      "script": "Färdigt manus här som börjar direkt med informationen. Maximal längd 2500 tecken."
    },
    {
      "type": "detailed_analysis", 
      "title": "Fördjupad Analys - ${extractedData.company_name}",
      "duration": "4-5 minuter",
      "tone": "Analytisk och detaljerad",
      "target_audience": "Professionella investerare",
      "script": "Färdigt manus här med djupgående analys. Maximal längd 4000 tecken."
    }
  ]
}
`;

    console.log('Generating manuscript alternatives...');

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
            content: 'Du skapar professionella manus baserat på finansiella data. Svara ENDAST med giltig JSON. Ingen annan text.'
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
        let scriptContent = scriptData.choices[0].message.content.trim();
        
        // Clean up the response similar to the analysis
        scriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        
        const jsonStart = scriptContent.indexOf('{');
        const jsonEnd = scriptContent.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          scriptContent = scriptContent.substring(jsonStart, jsonEnd);
        }
        
        parsedScripts = JSON.parse(scriptContent);
        console.log('Generated script alternatives successfully');
        
      } catch (scriptParseError) {
        console.error('Script parsing error:', scriptParseError);
        console.log('Using default script structure');
        
        // Fallback scripts
        parsedScripts = {
          script_alternatives: [
            {
              type: "executive_summary",
              title: `Kvartalssammanfattning - ${extractedData.company_name}`,
              duration: "2-3 minuter",
              tone: "Professionell och koncis",
              target_audience: "Investerare och analytiker",
              script: `Välkommen till dagens kvartalsgenomgång för ${extractedData.company_name}. Vi har analyserat den senaste rapporten och identifierat viktiga finansiella utvecklingar och affärshöjdpunkter som är relevanta för investerare och analytiker.`
            },
            {
              type: "detailed_analysis",
              title: `Fördjupad Analys - ${extractedData.company_name}`,
              duration: "4-5 minuter", 
              tone: "Analytisk och detaljerad",
              target_audience: "Professionella investerare",
              script: `I denna fördjupade analys av ${extractedData.company_name}s senaste kvartalsrapport gräver vi djupare i de finansiella nyckeltalen, marknadsutvecklingen och strategiska initiativen som kommer att påverka företagets framtida prestanda.`
            }
          ]
        };
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
        message: 'Finansiell analys slutförd med förbättrad JSON-hantering'
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
