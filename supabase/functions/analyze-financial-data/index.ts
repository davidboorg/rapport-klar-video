
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a focused financial analysis prompt
const createAnalysisPrompt = (content: string): string => {
  return `
Du är en finansiell analytiker. Analysera denna text och extrahera exakt finansiell information.

VIKTIGT: Använd endast information som FAKTISKT finns i texten. Om något inte finns, skriv "Ej tillgänglig".

Returnera JSON i exakt detta format:
{
  "company_name": "Exakt företagsnamn från texten",
  "period": "Exakt period/år från texten",
  "financial_metrics": {
    "revenue": "Omsättning med exakt siffra och valuta",
    "growth_rate": "Tillväxt i % om angivet",
    "operating_result": "Rörelseresultat med siffra",
    "net_result": "Nettoresultat med siffra"
  },
  "key_highlights": ["Max 3 faktiska punkter från texten"],
  "data_quality": "high om du hittar företagsnamn och siffror, annars low"
}

Text att analysera:
${content.substring(0, 2000)}
`;
};

// Generate script based on extracted data
const generateScript = (financialData: any): string => {
  const company = financialData.company_name !== 'Ej tillgänglig' ? financialData.company_name : null;
  const period = financialData.period !== 'Ej tillgänglig' ? financialData.period : null;
  const metrics = financialData.financial_metrics || {};
  
  // Only generate if we have real data
  if (!company || financialData.data_quality === 'low') {
    throw new Error('Kunde inte extrahera tillräckligt med finansiell information från dokumentet för att skapa ett meningsfullt manus');
  }
  
  let script = `Välkommen till en finansiell sammanfattning för ${company}`;
  if (period) {
    script += ` för ${period}`;
  }
  script += '.\n\n';

  // Add financial metrics
  let hasMetrics = false;
  
  if (metrics.revenue && metrics.revenue !== 'Ej tillgänglig') {
    script += `Omsättningen uppgick till ${metrics.revenue}.\n`;
    hasMetrics = true;
  }
  
  if (metrics.growth_rate && metrics.growth_rate !== 'Ej tillgänglig') {
    script += `Tillväxten var ${metrics.growth_rate}.\n`;
    hasMetrics = true;
  }
  
  if (metrics.operating_result && metrics.operating_result !== 'Ej tillgänglig') {
    script += `Rörelseresultatet blev ${metrics.operating_result}.\n`;
    hasMetrics = true;
  }
  
  if (metrics.net_result && metrics.net_result !== 'Ej tillgänglig') {
    script += `Nettoresultatet uppgick till ${metrics.net_result}.\n`;
    hasMetrics = true;
  }

  if (!hasMetrics) {
    throw new Error('Inga konkreta finansiella siffror kunde extraheras från dokumentet');
  }

  // Add highlights
  const highlights = financialData.key_highlights || [];
  if (highlights.length > 0 && highlights[0] !== 'Ej tillgänglig') {
    script += '\nViktiga punkter:\n';
    highlights.forEach((highlight: string) => {
      if (highlight && highlight !== 'Ej tillgänglig') {
        script += `• ${highlight}\n`;
      }
    });
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

    if (!projectId || !pdfText) {
      throw new Error('Missing projectId or pdfText');
    }

    if (pdfText.length < 100) {
      throw new Error('PDF text too short for meaningful analysis');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Calling OpenAI for financial analysis...');
    
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
            content: 'Du är en finansiell analytiker som extraherar exakt information från dokument. Returnera endast giltig JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('OpenAI analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw AI response:', content.substring(0, 500));
      
      // Clean and parse JSON
      let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data:', extractedData);
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      throw new Error('AI returnerade ogiltig data - kunde inte tolka svaret');
    }

    // Try to generate script - this will throw if data quality is too low
    const generatedScript = generateScript(extractedData);
    
    const scriptAlternatives = [
      {
        type: 'executive',
        title: 'Finansiell sammanfattning',
        duration: '2-3 minuter',
        script: generatedScript,
        tone: 'Professionell',
        key_points: extractedData.key_highlights || []
      }
    ];

    // Save results to database
    const { error: contentError } = await supabase
      .from('generated_content')
      .upsert({
        project_id: projectId,
        script_text: generatedScript,
        generation_status: 'completed',
        script_alternatives: scriptAlternatives
      });

    if (contentError) {
      console.error('Error saving content:', contentError);
    }

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
        message: 'Finansiell analys och manus genererat framgångsrikt'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    
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
