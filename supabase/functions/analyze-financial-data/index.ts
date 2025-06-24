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
    
    console.log('Starting enhanced AI analysis for project:', projectId);
    console.log('PDF text length:', pdfText?.length || 0);

    if (!projectId || !pdfText) {
      throw new Error('Missing projectId or pdfText');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Prepare the text for analysis - truncate if too long but keep key sections
    let analysisText = pdfText;
    if (pdfText.length > 15000) {
      // Take first 7500 and last 7500 characters to capture both intro and conclusion
      const firstHalf = pdfText.substring(0, 7500);
      const lastHalf = pdfText.substring(pdfText.length - 7500);
      analysisText = firstHalf + "\n\n[...fortsättning...]\n\n" + lastHalf;
      console.log('Text truncated for analysis. Original:', pdfText.length, 'Processed:', analysisText.length);
    }

    // Step 1: Extract financial data
    const analysisPrompt = `
Analysera denna finansiella rapport noggrant och extrahera verkliga finansiella nyckeltal. Returnera ENDAST giltig JSON i exakt detta format:

{
  "company_name": "Verkligt företagsnamn från rapporten",
  "period": "Verklig period från rapporten (t.ex. Q4 2024, H1 2025)",
  "report_type": "Quarterly/Annual/Other",
  "currency": "SEK/USD/EUR (från rapporten)",
  "revenue": "Verkliga intäkter med enhet (t.ex. 156.7 miljoner SEK)",
  "ebitda": "Verkligt EBITDA med enhet",
  "growth_percentage": "Verklig tillväxt i procent",
  "key_highlights": [
    "Specifika höjdpunkter från rapporten",
    "Verkliga affärshändelser och resultat",
    "Faktiska siffror och prestationer"
  ],
  "concerns": [
    "Verkliga utmaningar nämnda i rapporten",
    "Faktiska risker eller problem"
  ],
  "ceo_quote": "Verkligt citat från VD eller ledning (om tillgängligt)",
  "forward_guidance": "Verklig framtidsguidning från rapporten"
}

Finansiell rapport:
${analysisText}
`;

    console.log('Extracting financial data with OpenAI...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Du är en finansiell rapportanalytiker. Extrahera ENDAST verkliga data från rapporten. Returnera ENDAST giltig JSON utan förklaringar.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Financial analysis received');

    let financialData;
    try {
      const content = openAIData.choices[0].message.content.trim();
      console.log('AI financial response:', content.substring(0, 200) + '...');
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      financialData = JSON.parse(cleanedContent);
      console.log('Parsed financial data successfully');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Could not parse financial analysis as valid JSON');
    }

    // Save financial data to project
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        financial_data: financialData,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error(`Could not update project: ${updateError.message}`);
    }

    console.log('Financial data saved, generating script alternatives...');

    // Step 2: Generate TWO very different script alternatives based on the actual content
    const scriptPrompt = `
Baserat på denna finansiella rapport och extraherade data, skapa EXAKT TVÅ helt olika manusförslag för podcast/presentation. 

FINANSIELL DATA:
${JSON.stringify(financialData, null, 2)}

FULLSTÄNDIG RAPPORT (för kontext):
${analysisText.substring(0, 8000)}

KRAV:
1. Använd VERKLIGA siffror och fakta från rapporten
2. Varje manus max 5000 tecken
3. Två MYCKET olika tillvägagångssätt/toner
4. Konkreta detaljer, inte generiska fraser
5. Använd företagets verkliga namn och siffror

Returnera ENDAST giltig JSON:

{
  "script_alternatives": [
    {
      "type": "executive",
      "title": "Koncis Ledningsrapport",
      "duration": "2-3 minuter",
      "tone": "Professionell och resultatorienterad",
      "key_points": [
        "Verklig nyckelpoint från rapporten",
        "Konkret finansiell prestation",
        "Specifik framtidsutsikt"
      ],
      "script": "FULLSTÄNDIGT MANUS HÄR - börja direkt med företagets namn och period. Använd VERKLIGA siffror från rapporten. Fokusera på nyckelresultat och framtid. Max 5000 tecken."
    },
    {
      "type": "investor",
      "title": "Detaljerad Investeraranalys",
      "duration": "4-5 minuter",
      "tone": "Analytisk och djupgående",
      "key_points": [
        "Detaljerad finansiell breakdown",
        "Marknadskontext och jämförelser",
        "Risker och möjligheter"
      ],
      "script": "FULLSTÄNDIGT MANUS HÄR - djupgående analys med alla viktiga finansiella mått från rapporten. Inkludera kontext, trender och framtidsbedömning. Max 5000 tecken."
    }
  ]
}

VIKTIGT: Manusen ska vara färdiga att läsa upp, inte bara sammanfattningar!
`;

    console.log('Generating detailed script alternatives...');

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
            content: 'Du är en expert på att skapa podcast-manus baserat på finansiella rapporter. Skapa två mycket olika, konkreta manus som använder verkliga data från rapporten. Manusen ska vara färdiga att läsa upp, inte bara punktlistor.'
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        console.log('Script response received, length:', scriptContent.length);
        
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsedScripts = JSON.parse(cleanedScriptContent);
        
        if (parsedScripts.script_alternatives && Array.isArray(parsedScripts.script_alternatives)) {
          console.log('Generated script alternatives:', parsedScripts.script_alternatives.length);
          
          // Validate and log script lengths
          parsedScripts.script_alternatives.forEach((script, index) => {
            console.log(`Script ${index + 1} (${script.type}): ${script.script?.length || 0} characters`);
          });

          // Save script alternatives
          const { error: contentError } = await supabase
            .from('generated_content')
            .upsert({
              project_id: projectId,
              script_alternatives: parsedScripts.script_alternatives,
              script_text: parsedScripts.script_alternatives[0]?.script || '', // Default to first script
              generation_status: 'completed',
              updated_at: new Date().toISOString(),
            });

          if (contentError) {
            console.error('Error saving script alternatives:', contentError);
          } else {
            console.log('Script alternatives saved successfully');
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

    console.log('Enhanced AI analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        financial_data: financialData,
        message: 'Enhanced financial analysis and script generation completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in enhanced analyze-financial-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred during enhanced AI analysis'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
