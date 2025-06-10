
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
    
    console.log('Starting AI analysis for project:', projectId);
    console.log('PDF text length:', pdfText?.length || 0);

    if (!projectId || !pdfText) {
      throw new Error('Saknas projectId eller pdfText');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key saknas i miljövariabler');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Förbättrad AI-prompt för bättre extraktion
    const analysisPrompt = `
Analysera denna svenska kvartalsrapport och extrahera finansiell information. Svara ENDAST med valid JSON utan extra text.

VIKTIG INSTRUKTION: Returnera data i följande exakta JSON-format:

{
  "company_name": "Företagsnamn",
  "period": "Q4 2024",
  "report_type": "Q4",
  "currency": "SEK",
  "revenue": "123.4 miljoner",
  "ebitda": "45.2 miljoner", 
  "growth_percentage": "+12.3%",
  "key_highlights": [
    "Stark tillväxt inom segment X",
    "Ny produktlansering genomförd",
    "Förbättrade marginaler"
  ],
  "concerns": [
    "Ökade råvarukostnader",
    "Marknadsturbulens"
  ],
  "ceo_quote": "Vi ser fortsatt stark efterfrågan...",
  "forward_guidance": "Förväntningar för nästa kvartal..."
}

Analysera denna rapport och fyll i all tillgänglig information:

${pdfText.substring(0, 15000)}
`;

    console.log('Sending request to OpenAI...');

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
            content: 'Du är en expert på svensk finansiell rapportanalys. Returnera ENDAST valid JSON utan extra text eller förklaringar.'
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
      throw new Error(`OpenAI API fel: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received');

    let financialData;
    try {
      const content = openAIData.choices[0].message.content.trim();
      console.log('AI response content:', content);
      
      // Rensa bort eventuell markdown formatting
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      financialData = JSON.parse(cleanedContent);
      console.log('Parsed financial data:', financialData);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', openAIData.choices[0].message.content);
      throw new Error('Kunde inte tolka AI-svaret som valid JSON');
    }

    // Spara finansiell data till projektet
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
      throw new Error(`Kunde inte uppdatera projekt: ${updateError.message}`);
    }

    console.log('Financial data saved to project');

    // Generera script-alternativ baserat på finansiell data
    const scriptPrompt = `
Baserat på denna finansiella data, skapa 3 professionella script-alternativ för en videot presentation.

Finansiell data:
${JSON.stringify(financialData, null, 2)}

Skapa scripts för dessa målgrupper:
1. Executive Summary (1-2 min, för upptagna chefer)
2. Investor Presentation (3-4 min, detaljerad för investerare)  
3. Social Media (30-60 sek, engagerande för sociala medier)

Returnera ENDAST valid JSON i detta format:

{
  "script_alternatives": [
    {
      "type": "executive",
      "title": "Executive Summary",
      "duration": "1-2 minuter",
      "tone": "Professionell och koncis",
      "key_points": ["punkt 1", "punkt 2", "punkt 3"],
      "script": "Komplett script text här..."
    },
    {
      "type": "investor", 
      "title": "Investerarpresentation",
      "duration": "3-4 minuter",
      "tone": "Detaljerad och analytisk",
      "key_points": ["punkt 1", "punkt 2", "punkt 3"],
      "script": "Komplett script text här..."
    },
    {
      "type": "social",
      "title": "Social Media",
      "duration": "30-60 sekunder", 
      "tone": "Engagerande och lättillgänglig",
      "key_points": ["punkt 1", "punkt 2", "punkt 3"],
      "script": "Komplett script text här..."
    }
  ]
}
`;

    console.log('Generating script alternatives...');

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
            content: 'Du skapar professionella videoscript på svenska baserat på finansiell data. Returnera ENDAST valid JSON.'
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    if (!scriptResponse.ok) {
      console.error('Script generation failed, but continuing...');
    } else {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsedScripts = JSON.parse(cleanedScriptContent);
        
        console.log('Generated script alternatives:', parsedScripts.script_alternatives?.length || 0);

        // Spara script-alternativ
        const { error: contentError } = await supabase
          .from('generated_content')
          .upsert({
            project_id: projectId,
            script_alternatives: parsedScripts.script_alternatives,
            generation_status: 'completed',
            updated_at: new Date().toISOString(),
          });

        if (contentError) {
          console.error('Error saving script alternatives:', contentError);
        } else {
          console.log('Script alternatives saved successfully');
        }

      } catch (scriptParseError) {
        console.error('Script parsing error:', scriptParseError);
      }
    }

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        financial_data: financialData,
        message: 'Finansiell analys och script-generering slutförd'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-financial-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Okänt fel uppstod under AI-analysen'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
