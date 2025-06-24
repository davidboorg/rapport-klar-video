
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Förbättrad prompt för att extrahera verklig data
const createAnalysisPrompt = (content: string): string => {
  return `
Analysera denna svenska finansiella text och extrahera VERKLIGA data. Returnera JSON:

{
  "company_name": "Företagsnamn (sök i texten)",
  "period": "Period som 'Q3 2024' eller '2023'",
  "financial_metrics": {
    "revenue": "Omsättning/intäkter med exakt siffra och enhet",
    "growth_rate": "Tillväxt i procent om tillgängligt",
    "operating_result": "Rörelseresultat om tillgängligt",
    "net_result": "Nettoresultat om tillgängligt"
  },
  "key_highlights": ["Lista viktiga punkter från texten"],
  "data_quality": "high om du hittar verkliga siffror, medium om delvis, low om ingen data",
  "currency": "SEK, EUR eller annan valuta om angiven"
}

VIKTIGT: 
- Hitta VERKLIGA företagsnamn och siffror från texten
- Om du inte kan hitta specifik data, skriv "Ej tillgänglig" 
- Använd ENDAST information som faktiskt finns i texten
- Leta efter nyckelord som "omsättning", "intäkter", "MSEK", "miljoner"

Text att analysera:
${content}
`;
};

// Funktion för att generera professionellt script från verklig data
const generateProfessionalScript = (financialData: any): string => {
  const company = financialData.company_name || 'företaget';
  const period = financialData.period || 'perioden';
  const revenue = financialData.financial_metrics?.revenue || 'ej rapporterad';
  const growth = financialData.financial_metrics?.growth_rate || null;
  const highlights = financialData.key_highlights || [];

  let script = `Välkommen till en finansiell sammanfattning för ${company} för ${period}.\n\n`;

  // Lägg till omsättning om tillgänglig
  if (revenue !== 'ej rapporterad' && revenue !== 'Ej tillgänglig') {
    script += `Omsättningen uppgick till ${revenue}`;
    if (growth) {
      script += `, vilket representerar en tillväxt på ${growth}`;
    }
    script += '.\n\n';
  }

  // Lägg till höjdpunkter om tillgängliga
  if (highlights.length > 0) {
    script += 'Viktiga höjdpunkter från perioden:\n';
    highlights.slice(0, 3).forEach((highlight: string) => {
      script += `• ${highlight}\n`;
    });
    script += '\n';
  }

  // Lägg till operationella resultat om tillgängliga
  const operatingResult = financialData.financial_metrics?.operating_result;
  const netResult = financialData.financial_metrics?.net_result;
  
  if (operatingResult && operatingResult !== 'Ej tillgänglig') {
    script += `Rörelseresultatet blev ${operatingResult}.\n`;
  }
  
  if (netResult && netResult !== 'Ej tillgänglig') {
    script += `Nettoresultatet uppgick till ${netResult}.\n\n`;
  }

  script += `Detta var en sammanfattning av ${company}s finansiella utveckling för ${period}. Tack för er uppmärksamhet.`;

  return script;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, pdfText } = await req.json();
    
    console.log('Starting enhanced financial analysis for project:', projectId);
    console.log('PDF text length received:', pdfText?.length || 0);

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

    console.log('Performing enhanced AI analysis...');
    
    const analysisPrompt = createAnalysisPrompt(pdfText);

    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du är en expert på finansiell analys som extraherar exakt information från svenska finansiella rapporter. Returnera alltid giltig JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI analysis error:', errorText);
      throw new Error(`Financial analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('Enhanced analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw analysis response:', content.substring(0, 500));
      
      // Rensa JSON-innehåll
      let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name || 'Unknown company');
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Kunde inte analysera dokumentet korrekt. Kontrollera att det innehåller finansiell information.');
    }

    // Generera professionellt script endast om vi har riktig data
    let generatedScript = '';
    let scriptAlternatives = [];

    if (extractedData.data_quality === 'high' || extractedData.data_quality === 'medium') {
      generatedScript = generateProfessionalScript(extractedData);
      
      scriptAlternatives = [
        {
          type: 'executive',
          title: 'Ledningssammanfattning',
          duration: '2-3 minuter',
          script: generatedScript,
          tone: 'Professionell',
          key_points: extractedData.key_highlights || ['Finansiell översikt', 'Nyckeltal', 'Periodens resultat']
        }
      ];

      // Spara det genererade scriptet
      const { error: contentError } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          script_text: generatedScript,
          generation_status: 'completed',
          script_alternatives: scriptAlternatives
        });

      if (contentError) {
        console.error('Error saving generated script:', contentError);
      }
    } else {
      throw new Error('Dokumentet innehåller inte tillräckligt med finansiell information för att generera ett meningsfullt script.');
    }

    // Spara finansiell data
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

    console.log('Enhanced analysis completed for:', extractedData.company_name);
    console.log('Data quality:', extractedData.data_quality);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.period,
        data_quality: extractedData.data_quality,
        financial_data: extractedData,
        scripts_generated: 'Yes',
        script_text: generatedScript,
        message: 'Förbättrad finansiell analys slutförd'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in enhanced financial analysis:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod under analysen'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
