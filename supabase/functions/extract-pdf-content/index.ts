
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
    const { pdfUrl, projectId } = await req.json();
    
    console.log('Starting PDF content extraction from:', pdfUrl);
    console.log('Project ID:', projectId);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let extractedText = '';
    let extractionMethod = 'unknown';

    try {
      console.log('Fetching PDF from URL:', pdfUrl);
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      console.log('PDF downloaded successfully, size:', pdfBytes.length, 'bytes');

      // Convert PDF to base64 for OpenAI Vision API
      const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
      
      console.log('Using OpenAI Vision API to extract text from PDF...');
      
      const ocrResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'Du är en expert på att extrahera text från finansiella rapporter. Extrahera ALL text från detta PDF-dokument exakt som det står. Behåll all formatering, siffror, tabeller och struktur. Returnera ENDAST den extraherade texten, inga kommentarer eller förklaringar.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extrahera all text från denna finansiella rapport. Inkludera alla siffror, tabeller, rubriker och innehåll. Behåll strukturen och formateringen så mycket som möjligt.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64Pdf}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        }),
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.error('OpenAI Vision API error:', errorText);
        throw new Error(`OpenAI Vision API failed: ${ocrResponse.status}`);
      }

      const ocrData = await ocrResponse.json();
      extractedText = ocrData.choices[0].message.content;
      extractionMethod = 'openai_vision_api';
      
      console.log('Successfully extracted text using OpenAI Vision API');
      console.log('Extracted text length:', extractedText.length);
      console.log('First 300 chars:', extractedText.substring(0, 300));

    } catch (fetchError) {
      console.error('PDF extraction error:', fetchError);
      throw new Error(`Could not extract PDF content: ${fetchError.message}`);
    }

    // Validate extracted content
    if (!extractedText || extractedText.length < 100) {
      throw new Error(`Insufficient text extracted from PDF. Got ${extractedText?.length || 0} characters`);
    }

    // Clean and validate the extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100000); // Limit to 100k characters

    console.log('Final extracted text length:', cleanedText.length, 'characters using method:', extractionMethod);
    console.log('Content preview (first 500 chars):', cleanedText.substring(0, 500));

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: cleanedText,
        method: extractionMethod,
        length: cleanedText.length,
        preview: cleanedText.substring(0, 200)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in extract-pdf-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred during PDF extraction'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
