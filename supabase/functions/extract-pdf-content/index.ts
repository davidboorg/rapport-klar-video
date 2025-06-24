
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved function to clean and extract meaningful content
const extractMeaningfulContent = (text: string): string => {
  console.log('Processing text of length:', text.length);
  
  // Remove control characters and normalize
  let cleanedText = text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to find readable Swedish/English words and numbers
  const meaningfulSentences: string[] = [];
  const sentences = cleanedText.split(/[.!?]+/).filter(s => s.length > 10);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    
    // Check if sentence contains meaningful words (at least 3 consecutive letters)
    const hasRealWords = /[a-öA-Ö]{3,}/.test(trimmed);
    // Check if sentence contains numbers that might be financial data
    const hasNumbers = /\d+/.test(trimmed);
    
    if (hasRealWords && hasNumbers && trimmed.length > 15) {
      meaningfulSentences.push(trimmed);
    }
    
    if (meaningfulSentences.length >= 20) break;
  }

  if (meaningfulSentences.length === 0) {
    // Fallback: try to extract any text with numbers
    const textWithNumbers = cleanedText.split(/\s+/)
      .filter(word => /\d/.test(word) && word.length > 2)
      .slice(0, 100)
      .join(' ');
      
    if (textWithNumbers.length > 50) {
      return textWithNumbers;
    }
    
    // Last resort: return first part that has some structure
    const firstPart = cleanedText.substring(0, 2000);
    if (firstPart.length > 100) {
      return firstPart;
    }
    
    throw new Error('PDF innehåller ingen läsbar text. Kontrollera att det är en textbaserad PDF och inte en bild.');
  }

  const result = meaningfulSentences.join('. ');
  console.log('Extracted meaningful content length:', result.length);
  return result.substring(0, 6000); // Limit for AI processing
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, projectId } = await req.json();
    
    console.log('Starting PDF extraction from:', pdfUrl);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let extractedText = '';
    let extractionMethod = 'unknown';

    try {
      console.log('Fetching PDF from URL...');
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');

      // Try pdf-parse first
      try {
        const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
        const pdfBuffer = new Uint8Array(pdfArrayBuffer);
        
        const pdfData = await pdfParse.default(pdfBuffer, {
          max: 0,
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        if (pdfData.text && pdfData.text.length > 100) {
          extractedText = pdfData.text;
          extractionMethod = 'pdf-parse';
          console.log('PDF-parse successful, extracted:', extractedText.length, 'characters');
        } else {
          throw new Error('PDF-parse returned insufficient text');
        }

      } catch (parseError) {
        console.log('PDF-parse failed, trying raw extraction...');
        
        // Alternative: raw text extraction
        const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
        const rawText = decoder.decode(pdfArrayBuffer);
        
        // Extract text patterns from PDF structure
        const textMatches = [
          ...rawText.matchAll(/\(([^)]{5,})\)/g),
          ...rawText.matchAll(/BT\s+([^ET]+)ET/g),
          ...rawText.matchAll(/Tj\s*\[\s*\(([^)]+)\)/g)
        ];
        
        if (textMatches.length > 0) {
          extractedText = textMatches
            .map(match => match[1] || match[0])
            .filter(text => text && text.length > 3)
            .join(' ');
          extractionMethod = 'raw-patterns';
          console.log('Raw extraction found text parts:', textMatches.length);
        } else {
          throw new Error('No readable text found in PDF');
        }
      }

    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }

    // Extract meaningful content
    const meaningfulContent = extractMeaningfulContent(extractedText);
    
    console.log('Final extracted content length:', meaningfulContent.length);
    console.log('Content preview:', meaningfulContent.substring(0, 200));

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: meaningfulContent,
        method: extractionMethod,
        length: meaningfulContent.length,
        quality_score: extractionMethod === 'pdf-parse' ? 'high' : 'medium'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in PDF extraction:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod vid PDF-extrahering'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
