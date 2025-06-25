
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction with better character handling
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting enhanced PDF text extraction with better encoding handling...');
  
  try {
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    console.log('PDF loaded, size:', pdfBytes.length, 'bytes');
    
    // First, validate this is actually a PDF
    const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 10));
    const headerString = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
    
    if (!headerString.startsWith('%PDF')) {
      throw new Error('Filen är inte en giltig PDF (saknar PDF-header)');
    }

    console.log('PDF validation passed, extracting with improved method...');
    
    // Convert to string with proper encoding handling
    let pdfText: string;
    try {
      // Try UTF-8 first
      pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
    } catch {
      try {
        // Fallback to latin1
        pdfText = new TextDecoder('latin1', { fatal: false }).decode(pdfBytes);
      } catch {
        // Final fallback to windows-1252
        pdfText = new TextDecoder('windows-1252', { fatal: false }).decode(pdfBytes);
      }
    }
    
    let extractedText = '';
    let textSegments: string[] = [];
    
    console.log('Strategy 1: Extracting from PDF text objects...');
    
    // Strategy 1: Look for text between parentheses in PDF operators (improved)
    const textPatterns = [
      /\(([^)]{2,})\)\s*(?:Tj|TJ)/g,  // Text showing operators
      /\[([^\]]{5,})\]\s*TJ/g,       // Array text showing
      /BT\s+(.+?)\s+ET/gs,           // Text blocks between BT/ET
    ];
    
    for (const pattern of textPatterns) {
      const matches = pdfText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          let text = match[1]
            .replace(/\\n/g, '\n')        // Convert \n to actual newlines
            .replace(/\\r/g, '\r')        // Convert \r to actual returns
            .replace(/\\t/g, '\t')        // Convert \t to actual tabs
            .replace(/\\\(/g, '(')        // Unescape parentheses
            .replace(/\\\)/g, ')')        
            .replace(/\\\\/g, '\\')       // Unescape backslashes
            .replace(/\\([0-7]{3})/g, (match, octal) => {
              // Convert octal escape sequences to characters
              return String.fromCharCode(parseInt(octal, 8));
            })
            .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
              // Convert unicode escape sequences
              return String.fromCharCode(parseInt(hex, 16));
            });
          
          // Clean up whitespace but preserve structure
          text = text.replace(/\s+/g, ' ').trim();
          
          // Filter out obvious encoding artifacts and short meaningless strings
          if (text.length >= 2 && 
              !/^[^a-zA-ZåäöÅÄÖ0-9\s]{3,}$/.test(text) && // Not just special chars
              /[a-zA-ZåäöÅÄÖ]/.test(text)) { // Contains actual letters
            textSegments.push(text);
          }
        }
      }
    }
    
    console.log('Strategy 2: Looking for readable words in streams...');
    
    // Strategy 2: Extract readable words from PDF streams
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    const streamMatches = pdfText.matchAll(streamRegex);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[1];
      
      // Look for Swedish and English words
      const wordPattern = /\b[a-zA-ZåäöÅÄÖ]{2,}\b/g;
      const words = streamContent.match(wordPattern);
      
      if (words && words.length > 0) {
        // Filter meaningful words
        const meaningfulWords = words.filter(word => 
          word.length >= 2 && 
          word.length <= 50 &&
          !/^[A-Z]{2,}$/.test(word) // Not just capital abbreviations
        );
        
        if (meaningfulWords.length > 2) {
          textSegments.push(meaningfulWords.join(' '));
        }
      }
      
      // Extract numbers and financial data
      const numberPattern = /\b\d{1,3}(?:[\s,]\d{3})*(?:[.,]\d{1,3})?\s?(?:kr|mkr|msek|miljoner|tkr|%|€|\$|SEK|USD|EUR)?\b/g;
      const numbers = streamContent.match(numberPattern);
      if (numbers) {
        textSegments.push(`SIFFROR: ${numbers.join(', ')}`);
      }
    }
    
    console.log('Strategy 3: Extracting financial terms and context...');
    
    // Strategy 3: Look for financial terms and their context
    const financialTerms = [
      'omsättning', 'intäkter', 'nettoomsättning', 'försäljning',
      'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT',
      'rörelseresultat', 'nettoresultat', 'årsresultat',
      'balans', 'tillgångar', 'skulder', 'eget kapital',
      'kassaflöde', 'likviditet', 'soliditet',
      'miljoner', 'miljarder', 'mkr', 'msek', 'tkr',
      'kvartal', 'helår', 'delår',
      'procent', 'tillväxt', 'minskning', 'ökning',
      'revenue', 'profit', 'loss', 'growth', 'sales'
    ];
    
    for (const term of financialTerms) {
      const termRegex = new RegExp(`(.{0,30}\\b${term}\\b.{0,30})`, 'gi');
      const termMatches = pdfText.matchAll(termRegex);
      
      for (const termMatch of termMatches) {
        let context = termMatch[1]
          .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (context.length > 5 && context.length < 150) {
          textSegments.push(`KONTEXT: ${context}`);
        }
      }
    }
    
    // Combine and clean all extracted content
    extractedText = textSegments.join('\n').trim();
    
    // Final cleanup and structuring
    extractedText = extractedText
      .replace(/\n{3,}/g, '\n\n')        // Max 2 consecutive newlines
      .replace(/\s+/g, ' ')              // Normalize whitespace
      .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2') // Add paragraphs after sentences
      .trim();
    
    console.log('Extraction completed. Total segments found:', textSegments.length);
    console.log('Final text length:', extractedText.length);
    console.log('Sample of extracted text:', extractedText.substring(0, 500));
    
    // Quality validation
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
    const hasFinancialTerms = financialTerms.some(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('Quality metrics:', {
      wordCount,
      hasNumbers,
      hasSwedishChars,
      hasFinancialTerms,
      length: extractedText.length
    });
    
    // Enhanced validation
    if (extractedText.length < 50) {
      throw new Error('Extraktionen gav för lite text. PDF:en kanske innehåller mest bilder eller har dålig textkvalitet.');
    }
    
    if (wordCount < 10) {
      throw new Error('För få läsbara ord hittades. Kontrollera att PDF:en innehåller text och inte bara bilder.');
    }
    
    // Check for garbage text (too many non-alphabetic characters)
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    if (alphaRatio < 0.3) {
      throw new Error('Texten verkar vara korrupt eller innehåller för många specialtecken. Försök med en annan PDF.');
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
    
    // Download PDF with better error handling
    const pdfResponse = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDF-Extractor/1.0)',
      }
    });
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const contentType = pdfResponse.headers.get('content-type');
    console.log('Content type:', contentType);

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded successfully, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('Nedladdad PDF är tom');
    }

    if (pdfArrayBuffer.byteLength < 100) {
      throw new Error('Nedladdad fil är för liten för att vara en giltig PDF');
    }

    console.log('Starting text extraction...');
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    console.log('=== EXTRACTION RESULTS ===');
    console.log('Extracted text length:', extractedText.length);
    
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
    
    console.log('Word count:', wordCount);
    console.log('Contains numbers:', hasNumbers);
    console.log('Contains Swedish characters:', hasSwedishChars);
    console.log('Sample (first 300 chars):', extractedText.substring(0, 300));

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'text_extracted',
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
        wordCount: wordCount,
        hasNumbers: hasNumbers,
        hasSwedishChars: hasSwedishChars,
        sample: extractedText.substring(0, 300),
        message: 'Text successfully extracted with improved encoding handling'
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
