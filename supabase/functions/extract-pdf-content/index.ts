
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Further optimized constants for faster processing
const MAX_PDF_SIZE = 5 * 1024 * 1024; // Reduced to 5MB for better performance
const EXTRACTION_TIMEOUT = 15000; // Reduced to 15 seconds
const MIN_TEXT_LENGTH = 20; // Minimum text length for validation
const DOWNLOAD_TIMEOUT = 8000; // 8 seconds for download
const MAX_PROCESSING_CHARS = 500000; // Limit processing to first 500KB of text

// Ultra-fast PDF text extraction with aggressive early termination
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING ULTRA-FAST PDF EXTRACTION ===');
  console.log('PDF size:', pdfArrayBuffer.byteLength, 'bytes');
  
  return new Promise(async (resolve, reject) => {
    // Aggressive timeout protection
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

      // Convert to string with limited size for performance
      let pdfText: string;
      const processingSize = Math.min(pdfArrayBuffer.byteLength, MAX_PROCESSING_CHARS);
      const limitedBytes = new Uint8Array(pdfArrayBuffer.slice(0, processingSize));
      
      try {
        pdfText = new TextDecoder('utf-8', { fatal: false }).decode(limitedBytes);
      } catch (error) {
        console.log('UTF-8 failed, trying latin1');
        pdfText = new TextDecoder('latin1', { fatal: false }).decode(limitedBytes);
      }
      
      let extractedText = '';
      let textSegments: string[] = [];
      
      console.log('Starting ultra-fast text extraction...');
      
      // STRATEGY 1: Basic text operators (most common and fastest) - VERY LIMITED
      const basicTextPattern = /\(([^)]{4,100})\)\s*(?:Tj|TJ)/g;
      let matches = Array.from(pdfText.matchAll(basicTextPattern));
      console.log('Strategy 1 - Basic text operators:', matches.length, 'matches');
      
      // Process only first 50 matches for speed
      for (const match of matches.slice(0, 50)) {
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
          
          if (text.length >= 4 && /[a-zA-ZåäöÅÄÖ0-9]/.test(text)) {
            textSegments.push(text);
          }
        }
        
        // Very early termination if we have enough text
        if (textSegments.length > 20 && textSegments.join(' ').length > 500) {
          console.log('Ultra-early termination - sufficient text found');
          break;
        }
      }
      
      // STRATEGY 2: Financial terms context (ultra-fast financial extraction)
      if (textSegments.length < 10) {
        const financialTerms = [
          'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust',
          'EBITDA', 'EBIT', 'miljoner', 'mkr', 'msek', 'kvartal'
        ];
        
        console.log('Strategy 2 - Ultra-fast financial context extraction...');
        let financialMatches = 0;
        
        // Process only first 3 terms for speed
        for (const term of financialTerms.slice(0, 3)) {
          const termRegex = new RegExp(`(.{0,50}\\b${term}\\b.{0,50})`, 'gi');
          const termMatches = Array.from(pdfText.matchAll(termRegex));
          financialMatches += termMatches.length;
          
          // Process only first 2 matches per term
          for (const termMatch of termMatches.slice(0, 2)) {
            let context = termMatch[1]
              .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (context.length > 10 && context.length < 100) {
              textSegments.push(context);
            }
          }
          
          // Stop if we have enough
          if (financialMatches > 3 && textSegments.join(' ').length > 300) {
            break;
          }
        }
        
        console.log('Financial terms found:', financialMatches, 'contexts');
      }
      
      // STRATEGY 3: Simple text patterns (if still need more)
      if (textSegments.length < 5) {
        console.log('Strategy 3 - Simple text patterns...');
        const simplePattern = /([A-ZÅÄÖ][a-zA-ZåäöÅÄÖ\s]{10,80})/g;
        const simpleMatches = Array.from(pdfText.matchAll(simplePattern));
        
        for (const match of simpleMatches.slice(0, 10)) {
          const text = match[1].trim();
          if (text.length > 10 && /[a-zA-ZåäöÅÄÖ]/.test(text)) {
            textSegments.push(text);
          }
        }
      }
      
      // Combine and clean all extracted segments - VERY LIMITED
      extractedText = textSegments
        .filter((segment, index, array) => array.indexOf(segment) === index) // Remove duplicates
        .filter(segment => segment.length >= 4) // Filter very short segments
        .slice(0, 50) // Limit to first 50 segments for performance
        .join(' ')
        .trim();
      
      // Final cleaning
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .trim();
      
      // Limit final text length for performance
      if (extractedText.length > 2000) {
        extractedText = extractedText.substring(0, 2000) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== ULTRA-FAST EXTRACTION COMPLETED ===');
      console.log('Text segments found:', textSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 100 chars):', extractedText.substring(0, 100));
      
      // Quality validation
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
      const hasNumbers = /\d/.test(extractedText);
      const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
      const hasFinancialTerms = ['omsättning', 'intäkter', 'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT', 'miljoner', 'mkr', 'msek', 'kvartal'].some(term => 
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  const startTime = Date.now();
  console.log('=== ULTRA-FAST PDF EXTRACTION REQUEST START ===');
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

    // Read request body with shorter timeout
    let requestBody;
    try {
      const bodyPromise = req.json();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
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
    
    // Download PDF with shorter timeout
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ReportFlow-PDFExtractor/5.0',
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

    console.log('=== STARTING ULTRA-FAST TEXT EXTRACTION ===');
    
    // Extract text from PDF with ultra-fast strategies
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
    const hasFinancialTerms = ['omsättning', 'intäkter', 'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT', 'miljoner', 'mkr', 'msek', 'kvartal'].some(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    const processingTime = Date.now() - startTime;
    
    console.log('=== ULTRA-FAST EXTRACTION SUCCESS ===');
    console.log('Final statistics:', {
      textLength: extractedText.length,
      wordCount,
      hasNumbers,
      hasSwedishChars,
      hasFinancialTerms,
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
          hasFinancialTerms: hasFinancialTerms,
          processingTimeMs: processingTime,
          fileSizeMB: Math.round(pdfArrayBuffer.byteLength / 1024 / 1024 * 100) / 100,
          sample: extractedText.substring(0, 150)
        },
        message: 'Text framgångsrikt extraherad från PDF med ultra-snabba strategier'
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
