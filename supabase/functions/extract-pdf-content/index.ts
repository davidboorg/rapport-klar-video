
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction with better error handling and encoding
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting enhanced PDF text extraction...');
  
  try {
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    console.log('PDF loaded, size:', pdfBytes.length, 'bytes');
    
    // Validate PDF header
    const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 10));
    const headerString = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
    
    if (!headerString.startsWith('%PDF')) {
      throw new Error('Filen är inte en giltig PDF (saknar PDF-header)');
    }

    console.log('PDF validation passed, extracting text...');
    
    // Convert to string with better encoding handling
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
    
    console.log('Extracting text using multiple strategies...');
    
    // Strategy 1: Look for text between parentheses in PDF operators
    const textPatterns = [
      /\(([^)]{3,})\)\s*(?:Tj|TJ)/g,    // Text showing operators
      /\[([^\]]{10,})\]\s*TJ/g,         // Array text showing
      /BT\s+(.+?)\s+ET/gs,              // Text blocks between BT/ET
    ];
    
    for (const pattern of textPatterns) {
      const matches = pdfText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          let text = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .replace(/\\([0-7]{3})/g, (match, octal) => {
              try {
                return String.fromCharCode(parseInt(octal, 8));
              } catch {
                return match;
              }
            });
          
          // Clean up and validate text
          text = text.replace(/\s+/g, ' ').trim();
          
          // Filter out garbage - must contain readable characters
          if (text.length >= 3 && 
              /[a-zA-ZåäöÅÄÖ]/.test(text) && 
              !/^[^a-zA-ZåäöÅÄÖ0-9\s]{5,}$/.test(text)) {
            textSegments.push(text);
          }
        }
      }
    }
    
    // Strategy 2: Look for readable words in streams
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    const streamMatches = pdfText.matchAll(streamRegex);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[1];
      
      // Extract Swedish and English words
      const wordPattern = /\b[a-zA-ZåäöÅÄÖ]{3,}\b/g;
      const words = streamContent.match(wordPattern);
      
      if (words && words.length > 3) {
        const meaningfulWords = words.filter(word => 
          word.length >= 3 && 
          word.length <= 30 &&
          !/^[A-Z]{3,}$/.test(word)
        );
        
        if (meaningfulWords.length > 3) {
          textSegments.push(meaningfulWords.join(' '));
        }
      }
    }
    
    // Strategy 3: Extract financial terms and context
    const financialTerms = [
      'omsättning', 'intäkter', 'försäljning', 'resultat', 'vinst', 'förlust',
      'EBITDA', 'EBIT', 'rörelseresultat', 'nettoresultat', 'årsresultat',
      'miljoner', 'miljarder', 'mkr', 'msek', 'tkr', 'kvartal', 'procent',
      'tillväxt', 'revenue', 'profit', 'growth', 'sales'
    ];
    
    for (const term of financialTerms) {
      const termRegex = new RegExp(`(.{0,50}\\b${term}\\b.{0,50})`, 'gi');
      const termMatches = pdfText.matchAll(termRegex);
      
      for (const termMatch of termMatches) {
        let context = termMatch[1]
          .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (context.length > 10 && context.length < 200) {
          textSegments.push(context);
        }
      }
    }
    
    // Combine and clean all extracted content
    extractedText = textSegments.join('\n').trim();
    
    // Final cleanup
    extractedText = extractedText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2')
      .trim();
    
    console.log('Extraction completed. Segments found:', textSegments.length);
    console.log('Final text length:', extractedText.length);
    console.log('Sample text:', extractedText.substring(0, 200));
    
    // Quality validation
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
    
    console.log('Quality metrics:', { wordCount, hasNumbers, hasSwedishChars, length: extractedText.length });
    
    // Enhanced validation
    if (extractedText.length < 50) {
      throw new Error('För lite text extraherad. PDF:en kanske innehåller mest bilder.');
    }
    
    if (wordCount < 10) {
      throw new Error('För få läsbara ord hittades. Kontrollera att PDF:en innehåller text.');
    }
    
    // Check for garbage text
    const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
    const totalCount = extractedText.replace(/\s/g, '').length;
    const alphaRatio = alphaCount / totalCount;
    
    if (alphaRatio < 0.4) {
      throw new Error('Texten verkar vara korrupt. Försök med en textbaserad PDF.');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF-extraktion misslyckades: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { pdfUrl, projectId } = requestBody;
    
    console.log('=== PDF EXTRACTION REQUEST ===');
    console.log('PDF URL:', pdfUrl);
    console.log('Project ID:', projectId);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Downloading PDF...');
    
    const pdfResponse = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDF-Extractor/1.0)',
      }
    });
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('PDF-filen är tom');
    }

    console.log('Starting text extraction...');
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    console.log('=== EXTRACTION SUCCESS ===');
    console.log('Text length:', extractedText.length);
    
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
    
    console.log('Metrics:', { wordCount, hasNumbers, hasSwedishChars });

    // Update project status - using correct enum value
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'processing',  // Use valid enum value instead of 'text_extracted'
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.log('Warning: Could not update project status:', updateError.message);
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
        message: 'Text successfully extracted'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('=== EXTRACTION FAILED ===');
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
