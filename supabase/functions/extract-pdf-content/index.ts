
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
const MIN_TEXT_LENGTH = 20; // Minimum text length för validering
const DOWNLOAD_TIMEOUT = 15000; // 15 sekunder för nedladdning

// Förbättrad PDF text extraktion med robust felhantering
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING PDF EXTRACTION ===');
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
      
      console.log('Starting text extraction with multiple strategies...');
      
      // Strategi 1: Extrahera text mellan parenteser i PDF operators
      const textPatterns = [
        /\(([^)]{2,})\)\s*(?:Tj|TJ)/g,    // Standard text operators
        /\[([^\]]{5,})\]\s*TJ/g,          // Array text operators
        /BT\s+(.+?)\s+ET/gs,              // Text blocks mellan BT/ET
        /\(([^)]+)\)\s*Tj/g,              // Enkel text operator
        /\/F\d+\s+\d+\s+Tf\s*\(([^)]+)\)/g, // Text med font-specifikation
      ];
      
      let totalMatches = 0;
      for (const pattern of textPatterns) {
        const matches = Array.from(pdfText.matchAll(pattern));
        totalMatches += matches.length;
        
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
            
            // Rensa text från PDF-artefakter
            text = text
              .replace(/\s+/g, ' ')
              .replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F\u1E00-\u1EFF]/g, ' ')
              .trim();
            
            // Filtrera bort skräp - måste innehålla läsbara tecken
            if (text.length >= 2 && /[a-zA-ZåäöÅÄÖ0-9]/.test(text)) {
              textSegments.push(text);
            }
          }
        }
      }
      
      console.log(`Found ${totalMatches} text matches across all patterns`);
      
      // Strategi 2: Sök efter läsbara ord i streams
      const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
      const streamMatches = Array.from(pdfText.matchAll(streamRegex));
      
      console.log(`Found ${streamMatches.length} streams to process`);
      
      for (const streamMatch of streamMatches) {
        const streamContent = streamMatch[1];
        // Försök extrahera läsbara ord
        const wordPattern = /\b[a-zA-ZåäöÅÄÖ0-9]{2,}\b/g;
        const words = streamContent.match(wordPattern);
        
        if (words && words.length > 2) {
          const extractedFromStream = words.join(' ');
          if (extractedFromStream.length > 10) {
            textSegments.push(extractedFromStream);
          }
        }
      }
      
      // Strategi 3: Sök efter finansiella termer och kontext
      const financialTerms = [
        'omsättning', 'intäkter', 'försäljning', 'resultat', 'vinst', 'förlust',
        'EBITDA', 'EBIT', 'rörelseresultat', 'nettoresultat', 'årsresultat',
        'miljoner', 'miljarder', 'mkr', 'msek', 'kvartal', 'procent', 'tillväxt',
        'revenue', 'profit', 'loss', 'growth', 'quarter', 'percent'
      ];
      
      for (const term of financialTerms) {
        const termRegex = new RegExp(`(.{0,50}\\b${term}\\b.{0,50})`, 'gi');
        const termMatches = Array.from(pdfText.matchAll(termRegex));
        
        for (const termMatch of termMatches) {
          let context = termMatch[1]
            .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (context.length > 5 && context.length < 200) {
            textSegments.push(context);
          }
        }
      }
      
      // Kombinera och rensa alla extraherade segment
      extractedText = textSegments
        .filter((segment, index, array) => array.indexOf(segment) === index) // Ta bort dubbletter
        .join(' ')
        .trim();
      
      // Slutlig rensning och formatering
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2')
        .trim();
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== EXTRACTION COMPLETED ===');
      console.log('Text segments found:', textSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 150 chars):', extractedText.substring(0, 150));
      
      // Kvalitetsvalidering
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
      const hasNumbers = /\d/.test(extractedText);
      
      console.log('Quality metrics:', { 
        wordCount, 
        hasNumbers, 
        textLength: extractedText.length,
        processingTimeMs: processingTime
      });
      
      // Validera extraherad text
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite text kunde extraheras från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH})`);
      }
      
      if (wordCount < 5) {
        throw new Error('För få läsbara ord hittades i PDF:en');
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
  console.log('User-Agent:', req.headers.get('user-agent'));

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

    // Kontrollera Supabase konfiguration
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Serverkonfiguration saknas',
          code: 'MISSING_CONFIG'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          'User-Agent': 'ReportFlow-PDFExtractor/2.0',
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

    console.log('=== STARTING TEXT EXTRACTION ===');
    
    // Extrahera text från PDF med timeout-skydd
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

    // Uppdatera projektstatus
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        console.log('Warning: Could not update project status:', updateError.message);
      }
    } catch (error) {
      console.log('Warning: Project update failed:', error);
    }

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
        message: 'Text framgångsrikt extraherad från PDF'
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
