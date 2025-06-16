
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
      throw new Error('Missing projectId or pdfText');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Extract financial data with OpenAI
    const analysisPrompt = `
Analyze this financial report and extract key financial data. Return ONLY valid JSON in this exact format:

{
  "company_name": "Company Name",
  "period": "Q4 2024",
  "report_type": "Quarterly",
  "currency": "SEK",
  "revenue": "123.4 million",
  "ebitda": "45.2 million", 
  "growth_percentage": "+12.3%",
  "key_highlights": [
    "Strong growth in segment X",
    "New product launch completed",
    "Improved margins"
  ],
  "concerns": [
    "Increased raw material costs",
    "Market turbulence"
  ],
  "ceo_quote": "We see continued strong demand...",
  "forward_guidance": "Expectations for next quarter..."
}

Financial report text:
${pdfText.substring(0, 10000)}
`;

    console.log('Sending request to OpenAI for financial analysis...');

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
            content: 'You are a financial report analyst. Return ONLY valid JSON without any explanations or markdown formatting.'
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
    console.log('OpenAI response received');

    let financialData;
    try {
      const content = openAIData.choices[0].message.content.trim();
      console.log('AI response content:', content);
      
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      financialData = JSON.parse(cleanedContent);
      console.log('Parsed financial data:', financialData);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Could not parse AI response as valid JSON');
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

    console.log('Financial data saved to project');

    // Generate script alternatives
    const scriptPrompt = `
Based on this financial data, create 3 professional script alternatives for video presentation.

Financial data:
${JSON.stringify(financialData, null, 2)}

Create scripts for these audiences:
1. Executive Summary (1-2 min, for busy executives)
2. Investor Presentation (3-4 min, detailed for investors)  
3. Social Media (30-60 sec, engaging for social media)

Return ONLY valid JSON in this format:

{
  "script_alternatives": [
    {
      "type": "executive",
      "title": "Executive Summary",
      "duration": "1-2 minutes",
      "tone": "Professional and concise",
      "key_points": ["point 1", "point 2", "point 3"],
      "script": "Complete script text here..."
    },
    {
      "type": "investor", 
      "title": "Investor Presentation",
      "duration": "3-4 minutes",
      "tone": "Detailed and analytical",
      "key_points": ["point 1", "point 2", "point 3"],
      "script": "Complete script text here..."
    },
    {
      "type": "social",
      "title": "Social Media",
      "duration": "30-60 seconds", 
      "tone": "Engaging and accessible",
      "key_points": ["point 1", "point 2", "point 3"],
      "script": "Complete script text here..."
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
            content: 'You create professional video scripts based on financial data. Return ONLY valid JSON.'
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

    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      
      try {
        const scriptContent = scriptData.choices[0].message.content.trim();
        const cleanedScriptContent = scriptContent.replace(/```json\n?|\n?```/g, '').trim();
        const parsedScripts = JSON.parse(cleanedScriptContent);
        
        console.log('Generated script alternatives:', parsedScripts.script_alternatives?.length || 0);

        // Save script alternatives
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
        message: 'Financial analysis and script generation completed'
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
        error: error.message || 'Unknown error occurred during AI analysis'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
