
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
    
    console.log('Starting REAL document analysis for project:', projectId);
    console.log('Actual PDF text length received:', pdfText?.length || 0);
    console.log('First 200 chars of actual content:', pdfText?.substring(0, 200) || 'NO CONTENT');

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

    // Prepare the text for analysis - intelligently truncate if needed
    let analysisText = pdfText;
    if (pdfText.length > 20000) {
      // Take first 10k and last 10k characters to capture both intro and conclusion
      const firstPart = pdfText.substring(0, 10000);
      const lastPart = pdfText.substring(pdfText.length - 10000);
      analysisText = firstPart + "\n\n[...document continues...]\n\n" + lastPart;
      console.log('Text intelligently truncated for analysis. Original:', pdfText.length, 'Processed:', analysisText.length);
    }

    // Step 1: Deep analysis of the actual document content
    const deepAnalysisPrompt = `
VIKTIGT: Du ska analysera DENNA SPECIFIKA rapport som jag skickar. Läs rapporten noggrant och extrahera VERKLIGA fakta och siffror.

Analysera denna finansiella rapport djupt och extrahera alla verkliga finansiella data och nyckelinformation. Returnera ENDAST giltig JSON:

{
  "company_name": "VERKLIGT företagsnamn från rapporten",
  "report_period": "VERKLIG rapportperiod (Q1 2024, H1 2025, etc.)",
  "report_type": "Quarterly/Annual/Interim/Other",
  "currency": "Verklig valuta från rapporten (SEK/USD/EUR/etc.)",
  "financial_metrics": {
    "revenue": "Verkliga intäkter med siffror och enhet",
    "operating_income": "Verkligt rörelseresultat",
    "net_income": "Verklig nettovinst/förlust", 
    "ebitda": "Verkligt EBITDA om tillgängligt",
    "growth_rate": "Verklig tillväxttakt i procent",
    "margins": "Verkliga marginaler"
  },
  "key_business_highlights": [
    "Specifika affärshöjdpunkter från rapporten",
    "Verkliga produktlansering eller avtal",
    "Faktiska marknadsexpansioner eller förändringar"
  ],
  "challenges_and_risks": [
    "Verkliga utmaningar som nämns i rapporten", 
    "Specifika risker eller problem som företaget diskuterar"
  ],
  "management_commentary": "Verkliga kommentarer från VD eller ledning",
  "market_context": "Verklig marknadssituation som beskrivs",
  "future_outlook": "Verklig framtidsguidning och förväntningar från rapporten",
  "specific_numbers": [
    "Lista alla viktiga siffror och procenttal som nämns",
    "Användarantal, marknadsandelar, etc."
  ]
}

ABSOLUT KRITISKT: Använd ENDAST information som faktiskt finns i rapporten nedan. Hitta på INGA siffror eller fakta.

Här är den kompletta rapporten som ska analyseras:

${analysisText}
`;

    console.log('Sending document for deep analysis...');

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
            content: 'Du är en expertanalytiker för finansiella rapporter. Du extraherar ENDAST verklig information från de dokument du får. Du hittar ALDRIG på siffror eller fakta.'
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
      throw new Error(`OpenAI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('Deep analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw analysis response:', content.substring(0, 300) + '...');
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanedContent);
      console.log('Successfully parsed extracted data for:', extractedData.company_name);
    } catch (parseError) {
      console.error('Analysis parsing error:', parseError);
      throw new Error('Could not parse financial analysis as valid JSON');
    }

    // Save the detailed analysis
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        financial_data: extractedData,
        status: 'analyzed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project with analysis:', updateError);
      throw new Error(`Could not update project: ${updateError.message}`);
    }

    console.log('Analysis saved, generating custom scripts...');

    // Step 2: Generate two very different scripts based on the REAL analysis
    const scriptGenerationPrompt = `
Baserat på denna VERKLIGA finansiella analys, skapa EXAKT TVÅ helt olika manusförslag för podcast/presentation.

ANVÄND ENDAST DENNA VERKLIGA DATA:
${JSON.stringify(extractedData, null, 2)}

ORIGINALTEXT (för kontext):
${analysisText.substring(0, 8000)}

Skapa två helt olika manus som använder de VERKLIGA siffrorna och fakten från analysen ovan.

Returnera ENDAST denna JSON-struktur:

{
  "script_alternatives": [
    {
      "type": "executive_summary",
      "title": "Koncis Ledningsrapport - ${extractedData.company_name}",
      "duration": "2-3 minuter",
      "tone": "Professionell och resultatorienterad",
      "target_audience": "Investerare och analytiker",
      "key_points": [
        "Verklig nyckelpoint från ${extractedData.company_name}s rapport",
        "Specifik finansiell prestation med verkliga siffror",
        "Konkret framtidsutsikt från rapporten"
      ],
      "script": "KOMPLETT MANUS HÄR - Börja med: 'I ${extractedData.report_period} rapporterade ${extractedData.company_name}...' Använd ALLA verkliga siffror från analysen. Gör detta till ett färdigt manus som går att läsa upp direkt. Maximalt 3000 tecken."
    },
    {
      "type": "detailed_analysis", 
      "title": "Fördjupad Investoranalys - ${extractedData.company_name}",
      "duration": "4-5 minuter",
      "tone": "Analytisk och detaljerad",
      "target_audience": "Professionella investerare",
      "key_points": [
        "Djupgående finansiell breakdown med verkliga tal",
        "Marknadskontext och konkurrensläge",
        "Specifika risker och möjligheter från rapporten"
      ],
      "script": "KOMPLETT MANUS HÄR - Börja med detaljerad analys av ${extractedData.company_name}s prestationer. Använd ALLA finansiella mått, tillväxtsiffror och kommentarer från ledningen. Inkludera marknadskontext och framtidsbedömning. Maximalt 4000 tecken."
    }
  ]
}

KRITISKT: Manusen måste vara FÄRDIGA att läsa upp, inte bara sammanfattningar eller punktlistor. Använd ENDAST verkliga data från analysen.
`;

    console.log('Generating custom scripts based on real data...');

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
            content: `Du är en expert på att skapa podcast-manus baserat på finansiella rapporter. Du använder ENDAST verkliga data och skapar färdiga manus som kan läsas upp direkt. Du arbetar specifikt med ${extractedData.company_name}s rapport för ${extractedData.report_period}.`
          },
          {
            role: 'user',
            content: scriptGenerationPrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 4000
      }),
    });

    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        console.log('Custom script response received, length:', scriptContent.length);
        
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsedScripts = JSON.parse(cleanedScriptContent);
        
        if (parsedScripts.script_alternatives && Array.isArray(parsedScripts.script_alternatives)) {
          console.log('Generated custom script alternatives:', parsedScripts.script_alternatives.length);
          
          // Log script details for verification
          parsedScripts.script_alternatives.forEach((script, index) => {
            console.log(`Script ${index + 1} (${script.type}): ${script.script?.length || 0} characters`);
            console.log(`Script ${index + 1} content preview:`, script.script?.substring(0, 150) || 'No content');
          });

          // Save the custom scripts
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
            console.error('Error saving custom scripts:', contentError);
          } else {
            console.log('Custom scripts saved successfully');
          }
        } else {
          console.error('Invalid script alternatives structure');
        }

      } catch (scriptParseError) {
        console.error('Script parsing error:', scriptParseError);
        console.error('Raw script response:', scriptData.choices[0]?.message?.content?.substring(0, 500));
      }
    } else {
      console.error('Script generation failed:', scriptResponse.status);
    }

    console.log('REAL document analysis completed successfully for:', extractedData.company_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.report_period,
        extraction_summary: `Analyzed real data for ${extractedData.company_name} (${extractedData.report_period})`,
        message: 'Real document analysis and custom script generation completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in real document analysis function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred during real document analysis'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
