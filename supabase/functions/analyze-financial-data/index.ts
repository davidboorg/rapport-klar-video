
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a focused financial analysis prompt (English)
const createAnalysisPrompt = (content: string): string => {
  return `
You are a meticulous financial analyst. Analyze the following text and extract ONLY factual financial information present in the text.

Important: Use only facts explicitly stated. If something is missing, write "Not available".

Return STRICT JSON in exactly this format:
{
  "company_name": "Exact company name from the text",
  "period": "Exact period/year from the text",
  "financial_metrics": {
    "revenue": "Revenue with exact figure and currency",
    "growth_rate": "Growth rate in % if stated",
    "operating_result": "Operating result with figure",
    "net_result": "Net result with figure"
  },
  "key_highlights": ["Up to 3 factual bullet points from the text"],
  "data_quality": "high if company and figures found, otherwise low"
}

Text to analyze:
${content.substring(0, 2000)}
`;
};

// Generate an executive-level English script based on extracted data
const generateScript = (financialData: any): string => {
  const company = financialData.company_name !== 'Not available' ? financialData.company_name : null;
  const period = financialData.period !== 'Not available' ? financialData.period : null;
  const metrics = financialData.financial_metrics || {};

  if (!company || financialData.data_quality === 'low') {
    throw new Error('Insufficient financial information to create a meaningful script');
  }

  const lines: string[] = [];
  lines.push(`Welcome to an executive financial update for ${company}${period ? ` for ${period}` : ''}.`);

  // Core metrics with polished phrasing
  if (metrics.revenue && metrics.revenue !== 'Not available') {
    lines.push(`Revenue came in at ${metrics.revenue}.`);
  }
  if (metrics.growth_rate && metrics.growth_rate !== 'Not available') {
    lines.push(`Growth was ${metrics.growth_rate}, reflecting disciplined execution.`);
  }
  if (metrics.operating_result && metrics.operating_result !== 'Not available') {
    lines.push(`Operating result reached ${metrics.operating_result}.`);
  }
  if (metrics.net_result && metrics.net_result !== 'Not available') {
    lines.push(`Net result was ${metrics.net_result}.`);
  }

  const highlights = (financialData.key_highlights || []).filter((h: string) => h && h !== 'Not available');
  if (highlights.length) {
    lines.push('Key highlights:');
    highlights.forEach((h: string) => lines.push(`• ${h}`));
  }

  lines.push('Thank you for listening.');

  // Executive yet accessible tone
  const script = lines.join('\n');
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
            content: 'You are a financial analyst who extracts precise information from documents. Return ONLY valid JSON.'
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
    title: 'Executive Financial Summary',
    duration: '2-3 minutes',
    script: generatedScript,
    tone: 'Executive, confident, accessible',
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
    message: 'Financial analysis and script generated successfully'
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
