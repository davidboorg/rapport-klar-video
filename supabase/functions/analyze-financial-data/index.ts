
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
    console.log('Text preview (first 300 chars):', pdfText?.substring(0, 300) || 'NO CONTENT');

    if (!projectId || !pdfText || pdfText.length < 100) {
      throw new Error('Missing projectId or insufficient PDF content for analysis');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Intelligent text preparation for analysis
    let analysisText = pdfText;
    if (pdfText.length > 50000) {
      // Take first 25k and last 25k characters for comprehensive analysis
      const firstPart = pdfText.substring(0, 25000);
      const lastPart = pdfText.substring(pdfText.length - 25000);
      analysisText = firstPart + "\n\n[...rapport fortsätter...]\n\n" + lastPart;
      console.log('Text intelligently truncated. Original:', pdfText.length, 'Processed:', analysisText.length);
    }

    // Step 1: Extract financial data and company information
    const analysisPrompt = `
ABSOLUT VIKTIGT: Du ska analysera DENNA SPECIFIKA finansiella rapport som jag skickar. Läs rapporten noggrant och extrahera VERKLIGA fakta och siffror från texten.

Analysera denna finansiella rapport djupt och extrahera alla verkliga finansiella data. Returnera ENDAST giltig JSON enligt denna struktur:

{
  "company_name": "VERKLIGT företagsnamn från rapporten",
  "report_period": "VERKLIG rapportperiod (Q1 2024, Q2 2024, etc.)",
  "report_type": "Quarterly/Annual/Interim/Other",
  "currency": "Verklig valuta från rapporten (SEK/USD/EUR/etc.)",
  "financial_metrics": {
    "revenue": "Verkliga intäkter med exakta siffror och enhet",
    "operating_income": "Verkligt rörelseresultat med siffror",
    "net_income": "Verklig nettovinst/förlust med siffror", 
    "ebitda": "Verkligt EBITDA om tillgängligt",
    "growth_rate": "Verklig tillväxttakt i procent från rapporten",
    "margins": "Verkliga marginaler med procentsatser"
  },
  "key_business_highlights": [
    "Specifika affärshöjdpunkter från rapporten med verkliga siffror",
    "Verkliga produktlanseringar eller avtal med detaljer",
    "Faktiska marknadsexpansioner med konkreta siffror"
  ],
  "challenges_and_risks": [
    "Verkliga utmaningar som nämns i rapporten", 
    "Specifika risker eller problem som företaget diskuterar"
  ],
  "management_commentary": "Verkliga kommentarer från VD eller ledning från rapporten",
  "market_context": "Verklig marknadssituation som beskrivs i rapporten",
  "future_outlook": "Verklig framtidsguidning från rapporten",
  "specific_numbers": [
    "Lista alla viktiga siffror och procenttal som nämns",
    "Användarantal, marknadsandelar, omsättningssiffror etc."
  ]
}

KRITISKT: Använd ENDAST information som faktiskt finns i denna specifika rapport. Hitta ALDRIG på siffror eller fakta.

Här är den kompletta rapporten som ska analyseras:

${analysisText}
`;

    console.log('Sending document for financial analysis...');

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
            content: 'Du är en expertanalytiker för finansiella rapporter. Du extraherar ENDAST verklig information från de dokument du får. Du hittar ALDRIG på siffror eller fakta. Du returnerar alltid valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
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
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanedContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name);
    } catch (parseError) {
      console.error('Analysis parsing error:', parseError);
      console.error('Full response:', analysisData.choices[0]?.message?.content);
      throw new Error('Could not parse financial analysis as valid JSON');
    }

    // Step 2: Generate two specific manuscript alternatives based on real data
    const scriptPrompt = `
Baserat på denna VERKLIGA finansiella analys, skapa EXAKT TVÅ helt olika manusförslag för podcast/presentation.

VERKLIGA FINANSIELLA DATA:
${JSON.stringify(extractedData, null, 2)}

ORIGINALRAPPORT (för kontext):
${analysisText.substring(0, 10000)}

Skapa två helt olika manus som använder de VERKLIGA siffrorna och fakten från analysen ovan. Manusen ska vara färdiga att läsa upp.

Returnera ENDAST denna JSON-struktur:

{
  "script_alternatives": [
    {
      "type": "executive_summary",
      "title": "Kort Sammanfattning - ${extractedData.company_name}",
      "duration": "2-3 minuter",
      "tone": "Professionell och resultatorienterad",
      "target_audience": "Investerare och analytiker",
      "key_points": [
        "Verklig nyckelpoint med specifika siffror",
        "Konkret finansiell prestation från rapporten",
        "Specifik framtidsutsikt med verkliga mål"
      ],
      "script": "KOMPLETT MANUS som börjar med: 'Under ${extractedData.report_period} rapporterade ${extractedData.company_name} följande resultat...' Använd ALLA verkliga siffror från analysen. Inkludera faktiska intäkter, vinster, och specifika affärshöjdpunkter. Måste vara färdigt att läsa upp direkt. Maximalt 3000 tecken."
    },
    {
      "type": "detailed_investor", 
      "title": "Fördjupad Analys - ${extractedData.company_name}",
      "duration": "4-5 minuter",
      "tone": "Analytisk och detaljerad",
      "target_audience": "Professionella investerare",
      "key_points": [
        "Djupgående finansiell breakdown med verkliga tal",
        "Marknadskontext och konkurrensposition",
        "Specifika risker och möjligheter från rapporten"
      ],
      "script": "KOMPLETT MANUS som börjar med: 'Vi gräver djupare i ${extractedData.company_name}s ${extractedData.report_period}-rapport...' Använd ALLA finansiella mått, tillväxtsiffror och ledningskommentarer från den verkliga rapporten. Inkludera exakta procenttal, valutabelopp och jämförelser. Maximalt 4000 tecken."
    }
  ]
}

ABSOLUT KRITISKT: 
- Manusen måste vara FÄRDIGA att läsa upp, inte bara punktlistor
- Använd ENDAST verkliga data från den specifika rapporten
- Inkludera exakta siffror, procenttal och valutabelopp
- Nämn specifika produkter, marknader eller händelser från rapporten
- Varje manus ska vara unikt i ton och fokus men baserat på samma verkliga data
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
            content: `Du skapar professionella podcast-manus baserat på verkliga finansiella rapporter. Du arbetar med ${extractedData.company_name}s rapport för ${extractedData.report_period}. Använd ENDAST verkliga data och skapa färdiga manus som kan läsas upp direkt.`
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        console.log('Script generation response received, length:', scriptContent.length);
        
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsedScripts = JSON.parse(cleanedScriptContent);
        
        if (parsedScripts.script_alternatives && Array.isArray(parsedScripts.script_alternatives)) {
          console.log('Generated script alternatives:', parsedScripts.script_alternatives.length);
          
          // Validate scripts
          parsedScripts.script_alternatives.forEach((script, index) => {
            console.log(`Script ${index + 1} (${script.type}): ${script.script?.length || 0} characters`);
            if (script.script && script.script.length > 100) {
              console.log(`Script ${index + 1} content valid`);
            } else {
              console.warn(`Script ${index + 1} content too short or missing`);
            }
          });

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
            throw new Error(`Could not update project: ${updateError.message}`);
          }

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
          } else {
            console.log('Scripts saved successfully');
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

    console.log('Analysis completed successfully for:', extractedData.company_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.report_period,
        extraction_summary: `Analyzed real data for ${extractedData.company_name} (${extractedData.report_period})`,
        message: 'Financial analysis and manuscript generation completed'
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
