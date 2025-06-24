
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved PDF text extraction using multiple strategies
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting improved PDF text extraction...');
  
  try {
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    const pdfText = new TextDecoder('latin1').decode(pdfBytes);
    
    console.log('PDF loaded, size:', pdfBytes.length, 'bytes');
    
    let extractedText = '';
    
    // Strategy 1: Look for standard PDF text operators
    const textOperators = [
      /\(([^)]+)\)\s*Tj/g,           // Simple text showing
      /\(([^)]+)\)\s*TJ/g,           // Text showing with individual glyph positioning
      /\[([^\]]+)\]\s*TJ/g,          // Array of text strings
      /BT\s+([^E]*?)\s+ET/gs,       // Text objects (between BT and ET)
    ];
    
    for (const regex of textOperators) {
      const matches = pdfText.matchAll(regex);
      for (const match of matches) {
        if (match[1]) {
          // Clean the matched text
          let text = match[1]
            .replace(/\\[nrt]/g, ' ')    // Replace escape sequences
            .replace(/\\\(/g, '(')       // Unescape parentheses
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .trim();
          
          if (text.length > 0) {
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // Strategy 2: Look for readable text patterns in stream content
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    const streamMatches = pdfText.matchAll(streamRegex);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[1];
      
      // Look for readable Swedish/English text patterns
      const readablePattern = /\b[A-ZÅÄÖa-zåäö]{3,}\b/g;
      const readableMatches = streamContent.matchAll(readablePattern);
      
      for (const readableMatch of readableMatches) {
        extractedText += readableMatch[0] + ' ';
      }
    }
    
    // Strategy 3: Simple string search for common financial terms
    const financialTerms = [
      'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust',
      'balans', 'tillgångar', 'skulder', 'eget kapital',
      'kassaflöde', 'mkr', 'msek', 'miljoner', 'tkr',
      'kvartal', 'helår', 'rapport', 'delårsrapport'
    ];
    
    for (const term of financialTerms) {
      const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
      const termMatches = pdfText.matchAll(termRegex);
      for (const termMatch of termMatches) {
        // Extract context around the term (50 chars before and after)
        const start = Math.max(0, termMatch.index! - 50);
        const end = Math.min(pdfText.length, termMatch.index! + term.length + 50);
        const context = pdfText.substring(start, end);
        
        // Clean and add context
        const cleanContext = context
          .replace(/[^\w\såäöÅÄÖ.,\-\d]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanContext.length > 10) {
          extractedText += cleanContext + ' ';
        }
      }
    }
    
    // Final cleanup
    extractedText = extractedText
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/[^\w\såäöÅÄÖ.,\-\d%]/g, ' ')  // Keep only readable characters
      .trim();
    
    console.log('Extraction completed. Text length:', extractedText.length);
    console.log('Sample text:', extractedText.substring(0, 200));
    
    if (extractedText.length < 20) {
      // If we still don't have much text, try a more aggressive approach
      console.log('Low text yield, trying aggressive extraction...');
      
      // Look for any alphanumeric sequences
      const aggressivePattern = /[A-ZÅÄÖa-zåäö0-9]{2,}/g;
      const aggressiveMatches = pdfText.matchAll(aggressivePattern);
      
      let aggressiveText = '';
      for (const match of aggressiveMatches) {
        aggressiveText += match[0] + ' ';
      }
      
      if (aggressiveText.length > extractedText.length) {
        extractedText = aggressiveText.trim();
      }
    }
    
    if (extractedText.length < 10) {
      throw new Error('Kunde inte extrahera läsbar text från PDF:en. Kontrollera att filen innehåller text och inte bara bilder.');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF-textextraktion misslyckades: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, projectId } = await req.json();
    
    console.log('=== PDF EXTRACTION REQUEST ===');
    console.log('PDF URL:', pdfUrl);
    console.log('Project ID:', projectId);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Download PDF with better error handling
    console.log('Downloading PDF from:', pdfUrl);
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const contentType = pdfResponse.headers.get('content-type');
    console.log('Content type:', contentType);
    
    if (contentType && !contentType.includes('pdf')) {
      console.warn('Content type is not PDF:', contentType);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded successfully, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    if (pdfArrayBuffer.byteLength < 100) {
      throw new Error('Downloaded file is too small to be a valid PDF');
    }

    // Check if it's actually a PDF file by looking for PDF header
    const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 10));
    const headerString = new TextDecoder().decode(headerBytes);
    
    if (!headerString.startsWith('%PDF')) {
      throw new Error('File is not a valid PDF (missing PDF header)');
    }

    console.log('PDF validation passed, extracting text...');

    // Extract text using our improved method
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    console.log('=== EXTRACTION RESULTS ===');
    console.log('Extracted text length:', extractedText.length);
    console.log('First 300 characters:', extractedText.substring(0, 300));

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
        content: extractedText,
        length: extractedText.length,
        message: 'Text successfully extracted using improved multi-strategy approach'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('=== PDF EXTRACTION FAILED ===');
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod vid PDF-extrahering',
        details: error.stack || 'No stack trace available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
