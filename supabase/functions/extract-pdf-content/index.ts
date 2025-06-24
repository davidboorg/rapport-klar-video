
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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let extractedText = '';
    let extractionMethod = 'unknown';

    try {
      // Try to fetch the PDF directly from the URL
      console.log('Attempting direct PDF fetch from:', pdfUrl);
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      console.log('PDF downloaded successfully, size:', pdfBytes.length, 'bytes');

      // Try to extract text using a simple text extraction approach
      // Convert PDF bytes to text (this is a simplified approach)
      try {
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = textDecoder.decode(pdfBytes);
        
        // Extract readable text from PDF content
        // Look for text objects and streams
        const textMatches = rawText.match(/\(([^)]+)\)/g) || [];
        const streamMatches = rawText.match(/stream\s*([\s\S]*?)\s*endstream/gi) || [];
        
        let extractedContent = '';
        
        // Extract text from parentheses (common PDF text format)
        textMatches.forEach(match => {
          const text = match.slice(1, -1); // Remove parentheses
          if (text.length > 2 && /[a-zA-Z0-9]/.test(text)) {
            extractedContent += text + ' ';
          }
        });

        // Try to extract from streams
        streamMatches.forEach(match => {
          const streamContent = match.replace(/^stream\s*|\s*endstream$/gi, '');
          // Simple text extraction from stream
          const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          if (readable.length > 10) {
            extractedContent += readable + ' ';
          }
        });

        // Clean up the extracted text
        extractedText = extractedContent
          .replace(/\s+/g, ' ')
          .replace(/[^\w\såäöÅÄÖ.,!?:;()-]/g, ' ')
          .trim();

        if (extractedText.length > 100) {
          extractionMethod = 'direct_text_extraction';
          console.log('Successfully extracted text using direct method, length:', extractedText.length);
        } else {
          throw new Error('Direct extraction yielded insufficient text');
        }

      } catch (directError) {
        console.log('Direct text extraction failed:', directError.message);
        
        // Fallback: Use OCR-like approach with OpenAI Vision API
        try {
          const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
          if (!openAIApiKey) {
            throw new Error('OpenAI API key not available for OCR fallback');
          }

          // Convert first few pages to base64 and use OpenAI Vision
          const base64Pdf = btoa(String.fromCharCode(...pdfBytes.slice(0, 50000))); // First 50KB for analysis
          
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
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Extract all text content from this PDF document. Return only the extracted text, no explanations or formatting.'
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
              max_tokens: 4000
            }),
          });

          if (ocrResponse.ok) {
            const ocrData = await ocrResponse.json();
            extractedText = ocrData.choices[0].message.content;
            extractionMethod = 'openai_vision_ocr';
            console.log('Successfully extracted text using OpenAI Vision OCR, length:', extractedText.length);
          } else {
            throw new Error('OpenAI Vision OCR failed');
          }

        } catch (ocrError) {
          console.log('OCR extraction also failed:', ocrError.message);
          throw new Error('All extraction methods failed');
        }
      }

    } catch (fetchError) {
      console.error('PDF fetch error:', fetchError);
      throw new Error(`Could not fetch PDF: ${fetchError.message}`);
    }

    // Validate extracted content
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Insufficient text extracted from PDF');
    }

    // Clean and validate the extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000); // Limit to 50k characters for processing

    console.log('Final extracted text length:', cleanedText.length, 'characters using method:', extractionMethod);

    // Update project with extracted content
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'extracted',
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
        length: cleanedText.length
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
