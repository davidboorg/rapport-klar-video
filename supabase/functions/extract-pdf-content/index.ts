
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optimized constants for better performance
const MAX_PDF_SIZE = 8 * 1024 * 1024; // Reduced to 8MB for better performance
const EXTRACTION_TIMEOUT = 20000; // 20 seconds max
const MIN_TEXT_LENGTH = 30; // Minimum text length for validation
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds for download

// Optimized PDF text extraction with early termination
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING OPTIMIZED PDF EXTRACTION ===');
  console.log('PDF size:', pdfArrayBuffer.byteLength, 'bytes');
  
  return new Promise(async (resolve, reject) => {
    // Timeout protection
    const timeoutId = setTimeout(() => {
      reject(new Error(`PDF-extraktion timeout efter ${EXTRACTION_TIMEOUT/1000}s`));
    }, EXTRACTION_TIMEOUT);

    try {
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      // Quick PDF validation
      const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 8));
      const headerString = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
      
      if (!headerString.startsWith('%PDF')) {
        throw new Error('Filen är inte en giltig PDF');
      }

      console.log('PDF header validation passed');

      // Convert to string with fallback encoding
      let pdfText: string;
      try {
        pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      } catch (error) {
        console.log('UTF-8 failed, trying latin1');
        pdfText = new TextDecoder('latin1', { fatal: false }).decode(pdfBytes);
      }
      
      let extractedText = '';
      let textSegments: string[] = [];
      
      console.log('Starting optimized text extraction...');
      
      // STRATEGY 1: Basic text operators (most common and fastest)
      const basicTextPattern = /\(([^)]{3,200})\)\s*(?:Tj|TJ)/g;
      let matches = Array.from(pdfText.matchAll(basicTextPattern));
      console.log('Strategy 1 - Basic text operators:', matches.length, 'matches');
      
      for (const match of matches.slice(0, 500)) { // Limit to first 500 matches for performance
        if (match[1]) {
          let text = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          
          text = text
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F\u1E00-\u1EFF\u00C0-\u00FF]/g, ' ')
            .trim();
          
          if (text.length >= 3 && /[a-zA-ZåäöÅÄÖ0-9]/.test(text)) {
            textSegments.push(text);
          }
        }
        
        // Early termination if we have enough text
        if (textSegments.length > 100 && textSegments.join(' ').length > 2000) {
          console.log('Early termination - sufficient text found');
          break;
        }
      }
      
      // STRATEGY 2: Array text operators (if we need more text)
      if (textSegments.length < 50) {
        const arrayTextPattern = /\[([^\]]{5,100})\]\s*TJ/g;
        matches = Array.from(pdfText.matchAll(arrayTextPattern));
        console.log('Strategy 2 - Array text operators:', matches.length, 'matches');
        
        for (const match of matches.slice(0, 200)) {
          if (match[1]) {
            const arrayContent = match[1];
            const textParts = arrayContent.match(/\(([^)]+)\)/g);
            if (textParts) {
              for (const part of textParts.slice(0, 10)) {
                const cleanText = part.slice(1, -1)
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
          
          // Check if we have enough text
          if (textSegments.join(' ').length > 1500) {
            console.log('Sufficient text found with strategy 2');
            break;
          }
        }
      }
      
      // STRATEGY 3: Financial terms context (optimized for financial documents)
      const financialTerms = [
        'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust',
        'EBITDA', 'EBIT', 'miljoner', 'mkr', 'msek', 'kvartal', 'procent',
        'revenue', 'profit', 'growth', 'rapport', 'delårsrapport'
      ];
      
      console.log('Strategy 3 - Financial context extraction...');
      let financialMatches = 0;
      
      for (const term of financialTerms) {
        const termRegex = new RegExp(`(.{0,80}\\b${term}\\b.{0,80})`, 'gi');
        const termMatches = Array.from(pdfText.matchAll(termRegex));
        financialMatches += termMatches.length;
        
        for (const termMatch of termMatches.slice(0, 5)) { // Limit per term
          let context = termMatch[1]
            .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (context.length > 10 && context.length < 200) {
            textSegments.push(context);
          }
        }
        
        // Early exit if we found enough financial content
        if (financialMatches > 10 && textSegments.join(' ').length > 1000) {
          break;
        }
      }
      
      console.log('Financial terms found:', financialMatches, 'contexts');
      
      // Combine and clean all extracted segments
      extractedText = textSegments
        .filter((segment, index, array) => array.indexOf(segment) === index) // Remove duplicates
        .filter(segment => segment.length >= 3) // Filter very short segments
        .slice(0, 300) // Limit to first 300 segments for performance
        .join(' ')
        .trim();
      
      // Final cleaning and formatting
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== EXTRACTION COMPLETED ===');
      console.log('Text segments found:', textSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 150 chars):', extractedText.substring(0, 150));
      
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
        textLength: extractedText.length,
        processingTimeMs: processingTime
      });
      
      // Validate extracted text
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite text extraherad från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH})`);
      }
      
      if (wordCount < 8) {
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
  // Handle CORS preflight requests
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
    // Validate request method
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

    // Read request body with timeout
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

    // Validate required fields
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
    
    // Download PDF with robust timeout handling
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ReportFlow-PDFExtractor/4.0',
          'Accept': 'application/pdf,*/*',
        },
        signal: downloadController.signal
      });
    } catch (error) {
      clearTimeout(downloadTimeout);
      console.error('PDF download failed:', error);
      
      let errorMessage = 'Kunde inte ladda ner PDF-filen';
      if (error.name === 'AbortError') {
        errorMessage = `PDF-nedladdning timeout efter ${DOWNLOAD_TIMEOUT/1000}s`;
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

    // Check Content-Type
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

    // Check file size
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

    console.log('=== STARTING OPTIMIZED TEXT EXTRACTION ===');
    
    // Extract text from PDF with optimized strategies
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
    
    // Calculate final statistics
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

    // Return successful result with complete metadata
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
        message: 'Text framgångsrikt extraherad från PDF med optimerade strategier'
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
