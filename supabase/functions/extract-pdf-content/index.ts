
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Robusta konstanter för prestanda och säkerhet
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB max
const EXTRACTION_TIMEOUT = 25000; // 25 sekunder max
const MIN_TEXT_LENGTH = 50; // Minimum text length för validering
const DOWNLOAD_TIMEOUT = 15000; // 15 sekunder för nedladdning

// Förbättrad PDF text extraktion med flera strategier
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING ENHANCED PDF EXTRACTION ===');
  console.log('PDF size:', pdfArrayBuffer.byteLength, 'bytes');
  
  return new Promise(async (resolve, reject) => {
    // Timeout-skydd för att undvika CPU timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`PDF-extraktion tog för lång tid (timeout efter ${EXTRACTION_TIMEOUT/1000}s)`));
    }, EXTRACTION_TIMEOUT);

    try {
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      // Validera PDF header
      const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 10));
      const headerString = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
      
      if (!headerString.startsWith('%PDF')) {
        throw new Error('Filen är inte en giltig PDF');
      }

      console.log('PDF header validation passed');

      // Konvertera till string med robust encoding-hantering
      let pdfText: string;
      try {
        pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      } catch (error) {
        console.log('UTF-8 decoding failed, trying latin1');
        try {
          pdfText = new TextDecoder('latin1', { fatal: false }).decode(pdfBytes);
        } catch (fallbackError) {
          console.log('Latin1 decoding failed, using binary fallback');
          pdfText = Array.from(pdfBytes, byte => String.fromCharCode(byte)).join('');
        }
      }
      
      let extractedText = '';
      let textSegments: string[] = [];
      
      console.log('Starting multi-strategy text extraction...');
      
      // STRATEGI 1: Extrahera text mellan parenteser i PDF operators (mest vanlig)
      const basicTextPattern = /\(([^)]{3,})\)\s*(?:Tj|TJ)/g;
      let matches = Array.from(pdfText.matchAll(basicTextPattern));
      console.log('Strategy 1 - Basic text operators found:', matches.length, 'matches');
      
      for (const match of matches) {
        if (match[1]) {
          let text = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .replace(/\\([0-7]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
          
          // Rensa och validera text
          text = text
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F\u1E00-\u1EFF\u00C0-\u00FF]/g, ' ')
            .trim();
          
          if (text.length >= 3 && /[a-zA-ZåäöÅÄÖ0-9]/.test(text)) {
            textSegments.push(text);
          }
        }
      }
      
      // STRATEGI 2: Extrahera från array text operators
      const arrayTextPattern = /\[([^\]]{5,})\]\s*TJ/g;
      matches = Array.from(pdfText.matchAll(arrayTextPattern));
      console.log('Strategy 2 - Array text operators found:', matches.length, 'matches');
      
      for (const match of matches) {
        if (match[1]) {
          // Hantera array format med parenteser
          const arrayContent = match[1];
          const textParts = arrayContent.match(/\(([^)]+)\)/g);
          if (textParts) {
            for (const part of textParts) {
              const cleanText = part.slice(1, -1) // Ta bort parenteser
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (cleanText.length >= 2 && /[a-zA-ZåäöÅÄÖ0-9]/.test(cleanText)) {
                textSegments.push(cleanText);
              }
            }
          }
        }
      }
      
      // STRATEGI 3: Text blocks mellan BT/ET (Begin Text/End Text)
      const textBlockPattern = /BT\s+(.+?)\s+ET/gs;
      matches = Array.from(pdfText.matchAll(textBlockPattern));
      console.log('Strategy 3 - Text blocks (BT/ET) found:', matches.length, 'matches');
      
      for (const match of matches) {
        if (match[1]) {
          // Extrahera text från text block
          const blockContent = match[1];
          const textMatches = blockContent.match(/\(([^)]+)\)/g);
          if (textMatches) {
            for (const textMatch of textMatches) {
              const cleanText = textMatch.slice(1, -1)
                .replace(/\\n/g, '\n')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (cleanText.length >= 2 && /[a-zA-ZåäöÅÄÖ0-9]/.test(cleanText)) {
                textSegments.push(cleanText);
              }
            }
          }
        }
      }
      
      // STRATEGI 4: Sök efter finansiella termer och kontext (för finansiella rapporter)
      const financialTerms = [
        'omsättning', 'intäkter', 'försäljning', 'resultat', 'vinst', 'förlust',
        'EBITDA', 'EBIT', 'rörelseresultat', 'nettoresultat', 'årsresultat',
        'miljoner', 'miljarder', 'mkr', 'msek', 'kvartal', 'procent', 'tillväxt',
        'revenue', 'profit', 'loss', 'growth', 'quarter', 'percent', 'rapport',
        'delårsrapport', 'årsredovisning', 'kvartalsrapport'
      ];
      
      console.log('Strategy 4 - Searching for financial terms...');
      let financialMatches = 0;
      
      for (const term of financialTerms) {
        const termRegex = new RegExp(`(.{0,100}\\b${term}\\b.{0,100})`, 'gi');
        const termMatches = Array.from(pdfText.matchAll(termRegex));
        financialMatches += termMatches.length;
        
        for (const termMatch of termMatches) {
          let context = termMatch[1]
            .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (context.length > 10 && context.length < 300) {
            textSegments.push(context);
          }
        }
      }
      
      console.log('Financial terms found:', financialMatches, 'contexts');
      
      // STRATEGI 5: Extrahera strukturerad text (datum, siffror, etc.)
      const structuredPattern = /\b(?:\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d+[.,]\d+|\d+\s*%|\d+\s*mkr|\d+\s*msek)\b/gi;
      const structuredMatches = Array.from(pdfText.matchAll(structuredPattern));
      console.log('Strategy 5 - Structured data found:', structuredMatches.length, 'items');
      
      // Kombinera och rensa alla extraherade segment
      extractedText = textSegments
        .filter((segment, index, array) => array.indexOf(segment) === index) // Ta bort dubbletter
        .filter(segment => segment.length >= 3) // Filtrera mycket korta segment
        .join(' ')
        .trim();
      
      // Slutlig rensning och formatering
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Konsolidera whitespace
        .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2') // Lägg till radbrytningar efter meningar
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Begränsa till max 2 radbrytningar
        .trim();
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== EXTRACTION COMPLETED ===');
      console.log('Text segments found:', textSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 200 chars):', extractedText.substring(0, 200));
      
      // Kvalitetsvalidering
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
        textLength: extractedText.length,
        processingTimeMs: processingTime
      });
      
      // Validera extraherad text
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite text kunde extraheras från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH})`);
      }
      
      if (wordCount < 10) {
        throw new Error('För få läsbara ord hittades i PDF:en');
      }
      
      // Kolla om texten verkar vara meningsfull
      const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
      const totalCount = extractedText.replace(/\s/g, '').length;
      const alphaRatio = alphaCount / totalCount;
      
      if (alphaRatio < 0.3) {
        console.warn('Warning: Low alphabetic ratio detected:', alphaRatio);
      }
      
      clearTimeout(timeoutId);
      resolve(extractedText);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('PDF extraction error:', error);
      reject(error);
    }
  });
};

serve(async (req) => {
  // Hantera CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  const startTime = Date.now();
  console.log('=== PDF EXTRACTION REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  try {
    // Validera request method
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Endast POST-förfrågningar är tillåtna',
          code: 'INVALID_METHOD'
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Läs request body med timeout
    let requestBody;
    try {
      const bodyPromise = req.json();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      requestBody = await Promise.race([bodyPromise, timeoutPromise]);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ogiltig JSON i request body eller timeout',
          code: 'INVALID_JSON'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { pdfUrl, projectId } = requestBody;
    
    console.log('Request data:', { 
      pdfUrl: pdfUrl ? 'provided' : 'missing', 
      projectId,
      requestSize: JSON.stringify(requestBody).length 
    });

    // Validera required fields
    if (!pdfUrl) {
      console.error('Missing pdfUrl in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF URL saknas i förfrågan',
          code: 'MISSING_PDF_URL'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!projectId) {
      console.error('Missing projectId in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Projekt-ID saknas i förfrågan',
          code: 'MISSING_PROJECT_ID'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('=== DOWNLOADING PDF ===');
    console.log('PDF URL:', pdfUrl);
    
    // Ladda ner PDF med robust timeout och felhantering
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ReportFlow-PDFExtractor/3.0',
          'Accept': 'application/pdf',
        },
        signal: downloadController.signal
      });
    } catch (error) {
      clearTimeout(downloadTimeout);
      console.error('PDF download failed:', error);
      
      let errorMessage = 'Kunde inte ladda ner PDF-filen';
      if (error.name === 'AbortError') {
        errorMessage = `PDF-nedladdning tog för lång tid (timeout efter ${DOWNLOAD_TIMEOUT/1000}s)`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          code: 'DOWNLOAD_FAILED',
          details: error.message
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    clearTimeout(downloadTimeout);
    
    if (!pdfResponse.ok) {
      console.error('PDF download failed with status:', pdfResponse.status, pdfResponse.statusText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Kunde inte ladda ner PDF: HTTP ${pdfResponse.status} - ${pdfResponse.statusText}`,
          code: 'DOWNLOAD_ERROR'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Kontrollera Content-Type
    const contentType = pdfResponse.headers.get('content-type');
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      console.error('Invalid content type:', contentType);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Filen verkar inte vara en PDF (Content-Type: ${contentType})`,
          code: 'INVALID_CONTENT_TYPE'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded successfully. Size:', pdfArrayBuffer.byteLength, 'bytes');

    // Kontrollera filstorlek
    if (pdfArrayBuffer.byteLength === 0) {
      console.error('PDF file is empty');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF-filen är tom',
          code: 'EMPTY_FILE'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (pdfArrayBuffer.byteLength > MAX_PDF_SIZE) {
      console.error('PDF file too large:', pdfArrayBuffer.byteLength, 'bytes (max:', MAX_PDF_SIZE, ')');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `PDF-filen är för stor (${Math.round(pdfArrayBuffer.byteLength / 1024 / 1024)}MB, max ${MAX_PDF_SIZE / 1024 / 1024}MB)`,
          code: 'FILE_TOO_LARGE'
        }),
        { 
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('=== STARTING ENHANCED TEXT EXTRACTION ===');
    
    // Extrahera text från PDF med förbättrade strategier
    let extractedText;
    try {
      extractedText = await extractTextFromPDF(pdfArrayBuffer);
    } catch (error) {
      console.error('Text extraction failed:', error);
      
      let statusCode = 500;
      if (error.message.includes('timeout')) {
        statusCode = 504;
      } else if (error.message.includes('För lite text') || error.message.includes('För få')) {
        statusCode = 422;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Text-extraktion misslyckades: ${error.message}`,
          code: 'EXTRACTION_FAILED'
        }),
        { 
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Beräkna slutgiltig statistik
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
    const hasNumbers = /\d/.test(extractedText);
    const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
    const processingTime = Date.now() - startTime;
    
    console.log('=== EXTRACTION SUCCESS ===');
    console.log('Final statistics:', {
      textLength: extractedText.length,
      wordCount,
      hasNumbers,
      hasSwedishChars,
      processingTimeMs: processingTime,
      fileSizeMB: Math.round(pdfArrayBuffer.byteLength / 1024 / 1024 * 100) / 100
    });

    // Returnera framgångsrikt resultat med komplett metadata
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: extractedText,
        metadata: {
          length: extractedText.length,
          wordCount: wordCount,
          hasNumbers: hasNumbers,
          hasSwedishChars: hasSwedishChars,
          processingTimeMs: processingTime,
          fileSizeMB: Math.round(pdfArrayBuffer.byteLength / 1024 / 1024 * 100) / 100,
          sample: extractedText.substring(0, 200)
        },
        message: 'Text framgångsrikt extraherad från PDF med förbättrade strategier'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Processing time before error:', processingTime, 'ms');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Ett oväntat fel uppstod vid PDF-bearbetning',
        code: 'UNEXPECTED_ERROR',
        details: error.message,
        processingTimeMs: processingTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
