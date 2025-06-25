
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction with multiple strategies and better handling
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting enhanced PDF text extraction...');
  
  try {
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    console.log('PDF loaded, size:', pdfBytes.length, 'bytes');
    
    // Convert to text for pattern matching - using UTF-8 instead of latin1
    let pdfText: string;
    try {
      pdfText = new TextDecoder('utf-8').decode(pdfBytes);
    } catch {
      // Fallback to latin1 if UTF-8 fails
      pdfText = new TextDecoder('latin1').decode(pdfBytes);
    }
    
    let extractedText = '';
    let structuredContent: string[] = [];
    
    // Strategy 1: Look for text between parentheses in PDF operators
    console.log('Strategy 1: Extracting text from PDF operators...');
    const textPatterns = [
      /\(([^)]{3,})\)\s*(?:Tj|TJ)/g,  // Text showing operators - minimum 3 chars
      /\[([^\]]{10,})\]\s*TJ/g,       // Array text showing - minimum 10 chars
    ];
    
    for (const pattern of textPatterns) {
      const matches = pdfText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          let text = match[1]
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Filter out obvious encoding artifacts
          if (text.length >= 3 && 
              !/^[A-Z]{1,3}$/.test(text) && // Not just caps
              !/^\d{1,3}$/.test(text) && // Not just numbers
              /[a-zåäöA-ZÅÄÖäöü]/.test(text)) { // Contains letters
            structuredContent.push(text);
          }
        }
      }
    }
    
    // Strategy 2: Look for readable text patterns in stream content
    console.log('Strategy 2: Extracting from PDF streams...');
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    const streamMatches = pdfText.matchAll(streamRegex);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[1];
      
      // Look for words that are likely readable text
      const wordMatches = streamContent.match(/[A-ZÅÄÖa-zåäöü]{3,}/g);
      if (wordMatches) {
        for (const word of wordMatches) {
          if (word.length >= 3 && word.length <= 50) {
            structuredContent.push(word);
          }
        }
      }
      
      // Extract numbers that might be financial data
      const numberMatches = streamContent.match(/\b\d{1,3}(?:\s?\d{3})*(?:[.,]\d{1,3})?\s?(?:kr|mkr|msek|miljoner|tkr|%|€|\$)?\b/g);
      if (numberMatches) {
        structuredContent.push(...numberMatches);
      }
    }
    
    // Strategy 3: Look for specific financial terms and their context
    console.log('Strategy 3: Extracting financial context...');
    const financialTerms = [
      'omsättning', 'intäkter', 'nettoomsättning', 'försäljning',
      'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT',
      'rörelseresultat', 'nettoresultat', 'årsresultat',
      'balans', 'tillgångar', 'skulder', 'eget kapital',
      'kassaflöde', 'likviditet', 'soliditet',
      'miljoner', 'miljarder', 'mkr', 'msek', 'tkr', 'mdkr',
      'kvartal', 'helår', 'delår', 'januari', 'februari', 'mars',
      'april', 'maj', 'juni', 'juli', 'augusti', 'september',
      'oktober', 'november', 'december', '2024', '2025', '2023',
      'procent', 'tillväxt', 'minskning', 'ökning'
    ];
    
    for (const term of financialTerms) {
      const termRegex = new RegExp(`(.{0,50}\\b${term}\\b.{0,50})`, 'gi');
      const termMatches = pdfText.matchAll(termRegex);
      
      for (const termMatch of termMatches) {
        const context = termMatch[1]
          .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (context.length > 10 && context.length < 200) {
          structuredContent.push(`FINANCIAL: ${context}`);
        }
      }
    }
    
    // Strategy 4: Look for table-like structures
    console.log('Strategy 4: Looking for table structures...');
    const tablePattern = /(\d+[.,]\d+)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)/g;
    const tableMatches = pdfText.matchAll(tablePattern);
    
    for (const tableMatch of tableMatches) {
      structuredContent.push(`TABLE_ROW: ${tableMatch[0]}`);
    }
    
    // Combine and clean all extracted content
    extractedText = structuredContent.join(' ');
    
    // Final cleanup
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2') // Add paragraphs
      .trim();
    
    console.log('Extraction completed. Total segments found:', structuredContent.length);
    console.log('Final text length:', extractedText.length);
    console.log('First 500 characters:', extractedText.substring(0, 500));
    
    // Quality checks
    const wordCount = extractedText.split(/\s+/).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasFinancialTerms = financialTerms.some(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('Quality metrics:', {
      wordCount,
      hasNumbers,
      hasFinancialTerms,
      length: extractedText.length
    });
    
    if (extractedText.length < 100) {
      throw new Error('Extraktionen gav för lite text. PDF:en kanske innehåller mest bilder eller har dålig textkvalitet. Försök med en annan PDF-fil.');
    }
    
    if (wordCount < 20) {
      throw new Error('För få läsbara ord hittades i PDF:en. Kontrollera att dokumentet innehåller text och inte bara bilder.');
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
    
    console.log('=== ENHANCED PDF EXTRACTION REQUEST ===');
    console.log('PDF URL:', pdfUrl);
    console.log('Project ID:', projectId);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Downloading PDF from:', pdfUrl);
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const contentType = pdfResponse.headers.get('content-type');
    console.log('Content type:', contentType);

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded successfully, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    if (pdfArrayBuffer.byteLength < 100) {
      throw new Error('Downloaded file is too small to be a valid PDF');
    }

    // Validate PDF header
    const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 10));
    const headerString = new TextDecoder().decode(headerBytes);
    
    if (!headerString.startsWith('%PDF')) {
      throw new Error('File is not a valid PDF (missing PDF header)');
    }

    console.log('PDF validation passed, extracting text...');

    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    console.log('=== EXTRACTION RESULTS ===');
    console.log('Extracted text length:', extractedText.length);
    console.log('Word count:', extractedText.split(/\s+/).length);
    console.log('Contains numbers:', /\d/.test(extractedText));
    console.log('Sample (first 300 chars):', extractedText.substring(0, 300));

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
        wordCount: extractedText.split(/\s+/).length,
        hasNumbers: /\d/.test(extractedText),
        sample: extractedText.substring(0, 500),
        message: 'Text successfully extracted using enhanced multi-strategy approach'
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
