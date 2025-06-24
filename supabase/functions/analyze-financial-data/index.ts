
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optimized function to extract only the most important financial sections
const extractKeyFinancialData = (text: string): string => {
  console.log('Extracting key financial data from text of length:', text.length);
  
  // Focus on the most important financial keywords
  const criticalKeywords = [
    'omsättning', 'intäkter', 'revenue', 'rörelseresultat', 'EBIT', 
    'nettoresultat', 'vinst', 'förlust', 'miljoner', 'MSEK', 'MEUR',
    'tillväxt', 'procent', '%', 'Q1', 'Q2', 'Q3', 'Q4', 'kvartal'
  ];
  
  // Split into sentences and find the most relevant ones
  const sentences = text.split(/[.!?]+/).filter(s => s.length > 30);
  const relevantSentences: string[] = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const keywordCount = criticalKeywords.filter(keyword => 
      lowerSentence.includes(keyword.toLowerCase())
    ).length;
    
    // Only include sentences with multiple financial keywords
    if (keywordCount >= 2 && sentence.length < 300) {
      relevantSentences.push(sentence.trim());
    }
    
    // Stop when we have enough relevant content
    if (relevantSentences.length >= 8) break;
  }
  
  // If we found good sentences, use them. Otherwise, use a smaller sample
  let extractedText = '';
  if (relevantSentences.length > 0) {
    extractedText = relevantSentences.join('. ');
    console.log('Found', relevantSentences.length, 'key financial sentences');
  } else {
    // Fallback: take smaller chunk from beginning
    extractedText = text.substring(0, 3000);
    console.log('Using fallback: first 3k characters');
  }
  
  return extractedText;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, pdfText } = await req.json();
    
    console.log('Starting cost-optimized financial analysis for project:', projectId);
    console.log('PDF text length received:', pdfText?.length || 0);

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

    // Extract only the most critical financial content to minimize tokens
    const keyContent = extractKeyFinancialData(pdfText);
    console.log('Reduced text from', pdfText.length, 'to', keyContent.length, 'characters');

    // Simplified and shorter analysis prompt to reduce costs
    console.log('Performing cost-optimized AI analysis...');
    
    const analysisPrompt = `
Analysera denna finansiella text och returnera JSON:

{
  "company_name": "Företagsnamn från texten",
  "report_period": "Period som Q1 2024",
  "financial_metrics": {
    "revenue": "Omsättning med siffror",
    "growth_rate": "Tillväxt i procent"
  },
  "data_quality": "high om verkliga siffror, low annars"
}

Text: ${keyContent}
`;

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
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500 // Reduced from 3000 to save costs
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI analysis error:', errorText);
      throw new Error(`Financial analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('Cost-optimized analysis completed');

    let extractedData;
    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log('Raw analysis response preview:', content.substring(0, 300));
      
      // Clean JSON extraction
      let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }
      
      extractedData = JSON.parse(jsonContent);
      console.log('Successfully parsed financial data for:', extractedData.company_name || 'Unknown company');
      console.log('Data quality assessment:', extractedData.data_quality || 'unknown');
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback data structure for cost savings
      extractedData = {
        company_name: 'Okänt företag',
        report_period: 'Okänd period',
        financial_metrics: {
          revenue: 'Ej tillgänglig',
          growth_rate: 'Ej tillgänglig'
        },
        data_quality: 'low'
      };
    }

    // Skip expensive script generation to save costs - let the basic script handle it
    console.log('Skipping script generation to reduce costs');

    // Save minimal financial data
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

    console.log('Cost-optimized analysis completed for:', extractedData.company_name);
    console.log('Data quality:', extractedData.data_quality);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_analyzed: extractedData.company_name,
        period: extractedData.report_period,
        data_quality: extractedData.data_quality,
        financial_data: extractedData,
        scripts_generated: 'No', // Force basic script generation
        message: 'Kostnadsoptimerad finansiell analys'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in cost-optimized financial analysis:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred during analysis'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
