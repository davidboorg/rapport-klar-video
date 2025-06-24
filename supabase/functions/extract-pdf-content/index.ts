
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction that works in Deno
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting PDF text extraction with Deno-compatible method...');
  
  try {
    // Convert ArrayBuffer to Uint8Array for processing
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    const pdfString = new TextDecoder('latin1').decode(pdfBytes);
    
    console.log('PDF converted to string, length:', pdfString.length);
    
    // Extract text using regex patterns for PDF content streams
    let extractedText = '';
    
    // Pattern 1: Extract text from BT...ET blocks (text objects)
    const textObjectPattern = /BT\s*(.*?)\s*ET/gs;
    const textMatches = pdfString.matchAll(textObjectPattern);
    
    for (const match of textMatches) {
      const textContent = match[1];
      
      // Extract text from Tj and TJ operators
      const tjPattern = /\((.*?)\)\s*Tj/g;
      const tjMatches = textContent.matchAll(tjPattern);
      
      for (const tjMatch of tjMatches) {
        if (tjMatch[1]) {
          extractedText += tjMatch[1] + ' ';
        }
      }
      
      // Extract text from TJ arrays
      const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
      const tjArrayMatches = textContent.matchAll(tjArrayPattern);
      
      for (const tjArrayMatch of tjArrayMatches) {
        if (tjArrayMatch[1]) {
          // Extract strings from the array
          const stringPattern = /\((.*?)\)/g;
          const strings = tjArrayMatch[1].matchAll(stringPattern);
          for (const str of strings) {
            if (str[1]) {
              extractedText += str[1] + ' ';
            }
          }
        }
      }
    }
    
    // Pattern 2: Look for stream content that might contain text
    const streamPattern = /stream\s*(.*?)\s*endstream/gs;
    const streamMatches = pdfString.matchAll(streamPattern);
    
    for (const match of streamMatches) {
      const streamContent = match[1];
      
      // Try to extract readable text from streams
      const readableTextPattern = /\b[A-ZÄÖÅ][a-zäöå]{2,}\b/g;
      const readableMatches = streamContent.matchAll(readableTextPattern);
      
      for (const readableMatch of readableMatches) {
        extractedText += readableMatch[0] + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Text extraction completed. Raw length:', extractedText.length);
    
    if (extractedText.length < 50) {
      throw new Error('Kunde inte extrahera tillräckligt med text från PDF:en');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error(`PDF-textextraktion misslyckades: ${error.message}`);
  }
};

// Validate and clean extracted text
const validateAndCleanText = (text: string): string => {
  console.log('Validating extracted text, length:', text.length);
  
  // Remove control characters and normalize whitespace
  let cleanText = text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check if text contains actual readable words
  const wordPattern = /\b[a-öA-Ö]{3,}\b/g;
  const words = cleanText.match(wordPattern) || [];
  const numberPattern = /\d+/g;
  const numbers = cleanText.match(numberPattern) || [];
  
  console.log('Words found:', words.length, 'Numbers found:', numbers.length);
  
  if (words.length < 10) {
    throw new Error('PDF innehåller för få läsbara ord. Kontrollera att det är en textbaserad PDF och inte en skannad bild.');
  }
  
  // Look for financial keywords to ensure it's relevant
  const financialKeywords = [
    'kronor', 'mkr', 'msek', 'miljoner', 'miljarder', 'tkr',
    'omsättning', 'intäkter', 'vinst', 'resultat', 'balans', 'rapport',
    'revenue', 'profit', 'income', 'earnings', 'sek', 'eur', 'usd',
    'finansiell', 'kvartal', 'år', 'period'
  ];
  
  const hasFinancialContent = financialKeywords.some(keyword => 
    cleanText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!hasFinancialContent && numbers.length < 5) {
    console.log('Warning: Document may not contain financial data');
  }
  
  // Return the first 5000 characters for AI processing
  const result = cleanText.substring(0, 5000);
  console.log('Final cleaned text length:', result.length);
  
  return result;
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

    // Download PDF
    console.log('Downloading PDF...');
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    // Extract text from PDF using our Deno-compatible method
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    // Validate and clean the text
    const cleanedText = validateAndCleanText(extractedText);
    
    console.log('PDF extraction completed successfully');
    console.log('Text preview (first 200 chars):', cleanedText.substring(0, 200));

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
        content: cleanedText,
        length: cleanedText.length,
        quality: 'high',
        message: 'Text successfully extracted from PDF using Deno-compatible method'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('PDF extraction error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod vid PDF-extrahering',
        details: 'Could not extract readable text from the PDF file using Deno-compatible method'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
