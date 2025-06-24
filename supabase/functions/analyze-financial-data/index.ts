
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified analysis prompt to be more cost-effective
const createAnalysisPrompt = (content: string): string => {
  return `
Analysera denna text och extrahera finansiell information. Returnera JSON i detta format:

{
  "company_name": "Företagsnamn (leta efter AB, Ltd, Inc, eller liknande)",
  "period": "Tidsperiod (Q1-Q4 2024, 2023, etc)",
  "financial_metrics": {
    "revenue": "Omsättning/intäkter med siffra",
    "growth_rate": "Tillväxt i %",
    "operating_result": "Rörelseresultat",
    "net_result": "Nettoresultat"
  },
  "key_highlights": ["Viktiga punkter"],
  "data_quality": "high/medium/low"
}

Om riktig data saknas, använd "Ej tillgänglig" för specifika fält men försök hitta företagsnamn och period.

Text: ${content.substring(0, 1500)}
`;
};

// Generate a basic but professional script from available data
const generateScriptFromData = (financialData: any): string => {
  const company = financialData.company_name !== 'Ej tillgänglig' ? financialData.company_name : null;
  const period = financialData.period !== 'Ej tillgänglig' ? financialData.period : null;
  
  let script = '';
  
  if (company && period) {
    script = `Välkommen till en finansiell sammanfattning för ${company} för ${period}.\n\n`;
  } else if (company) {
    script = `Välkommen till en finansiell sammanfattning för ${company}.\n\n`;
  } else {
    script = `Välkommen till denna finansiella sammanfattning.\n\n`;
  }

  // Add financial metrics if available
  const metrics = financialData.financial_metrics || {};
  let hasRealData = false;
  
  if (metrics.revenue && metrics.revenue !== 'Ej tillgänglig') {
    script += `Omsättningen uppgick till ${metrics.revenue}.\n`;
    hasRealData = true;
  }
  
  if (metrics.growth_rate && metrics.growth_rate !== 'Ej tillgänglig') {
    script += `Detta representerar en tillväxt på ${metrics.growth_rate}.\n`;
    hasRealData = true;
  }
  
  if (metrics.operating_result && metrics.operating_result !== 'Ej tillgänglig') {
    script += `Rörelseresultatet blev ${metrics.operating_result}.\n`;
    hasRealData = true;
  }
  
  if (metrics.net_result && metrics.net_result !== 'Ej tillgänglig') {
    script += `Nettoresultatet uppgick till ${metrics.net_result}.\n`;
    hasRealData = true;
  }

  // Add highlights if available
  const highlights = financialData.key_highlights || [];
  if (highlights.length > 0 && highlights[0] && highlights[0] !== 'Ej tillgänglig') {
    script += '\nViktiga höjdpunkter:\n';
    highlights.slice(0, 3).forEach((highlight: string) => {
      if (highlight && highlight !== 'Ej tillgänglig') {
        script += `• ${highlight}\n`;
      }
    });
  }

  if (!hasRealData) {
    script += '\nDokumentet har analyserats men innehåller begränsad finansiell information. ';
    script += 'För en mer detaljerad analys rekommenderas ett dokument med tydligare finansiella nyckeltal.\n';
  }

  script += '\nTack för er uppmärksamhet.';
  
  return script;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, pdfText } = await req.json();
    
    console.log('Starting financial analysis for project:', projectId);
    console.log('PDF text length received:', pdfText?.length || 0);

    if (!projectId || !pdfText || pdfText.length < 50) {
      throw new Error('Missing projectId or insufficient PDF content');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Performing AI analysis...');
    
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
            content: 'Du är en finansiell analytiker. Returnera endast giltig JSON utan extra text.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 600  // Reduced for cost efficiency
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI analysis error:', errorText);
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('AI analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw AI response:', content.substring(0, 300));
      
      // Clean JSON content
      let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data');
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback data structure
      extractedData = {
        company_name: 'Okänt företag',
        period: 'Okänd period',
        financial_metrics: {
          revenue: 'Ej tillgänglig',
          growth_rate: 'Ej tillgänglig',
          operating_result: 'Ej tillgänglig',
          net_result: 'Ej tillgänglig'
        },
        key_highlights: ['Dokumentanalys genomförd'],
        data_quality: 'low'
      };
    }

    // Always generate a script, regardless of data quality
    const generatedScript = generateScriptFromData(extractedData);
    
    const scriptAlternatives = [
      {
        type: 'executive',
        title: 'Finansiell sammanfattning',
        duration: '2-3 minuter',
        script: generatedScript,
        tone: 'Professionell',
        key_points: extractedData.key_highlights || ['Finansiell översikt']
      }
    ];

    // Save the generated script
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

    // Save financial data
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

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.period,
        data_quality: extractedData.data_quality,
        financial_data: extractedData,
        script_text: generatedScript,
        message: 'Finansiell analys slutförd'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in financial analysis:', error);
    
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
