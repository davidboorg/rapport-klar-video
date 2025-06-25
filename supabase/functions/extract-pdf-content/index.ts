
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants - much more conservative to avoid timeouts
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB (reduced from 8MB)
const EXTRACTION_TIMEOUT = 15000; // 15 seconds (reduced from 30s)
const MIN_TEXT_LENGTH = 50; // Reduced minimum
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds

// Simple PDF text extraction - optimized for speed
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Starting fast PDF extraction...');
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('PDF-extraktion timeout - filen är för komplex'));
    }, EXTRACTION_TIMEOUT);

    try {
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      // Quick PDF validation
      const header = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes.slice(0, 8));
      if (!header.startsWith('%PDF')) {
        throw new Error('Inte en giltig PDF-fil');
      }

      // Convert to text - simple approach
      const pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      
      const textSegments: string[] = [];
      
      // Strategy 1: Quick parentheses extraction (limit iterations)
      const parenthesesRegex = /\(([^)]{5,200})\)/g;
      let match;
      let iterations = 0;
      const maxIterations = 500; // Limit to prevent timeout
      
      while ((match = parenthesesRegex.exec(pdfText)) !== null && iterations < maxIterations) {
        iterations++;
        let text = match[1];
        
        // Skip obvious metadata quickly
        if (text.includes('Creator') || text.includes('Producer') || 
            text.includes('Mozilla') || text.includes('Chrome') ||
            text.includes('Google Docs') || text.includes('PDF')) {
          continue;
        }
        
        // Quick clean
        text = text
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Basic content validation
        if (text.length >= 5 && /[a-zA-ZåäöÅÄÖ]{2,}/.test(text)) {
          textSegments.push(text);
        }
        
        // Stop if we have enough content
        if (textSegments.length >= 100) break;
      }
      
      console.log(`Found ${textSegments.length} text segments in ${iterations} iterations`);
      
      // Strategy 2: Quick search for readable text patterns (limited)
      if (textSegments.length < 20) {
        const readableRegex = /[A-Za-zÅÄÖåäö]{4,}(?:\s+[A-Za-zÅÄÖåäö0-9.,%-]{2,}){1,10}/g;
        const readableMatches = pdfText.match(readableRegex) || [];
        
        for (const text of readableMatches.slice(0, 50)) { // Limit to 50
          if (text.length > 8 && !text.includes('Creator') && !text.includes('Producer')) {
            const cleaned = text.replace(/\s+/g, ' ').trim();
            if (cleaned.length >= 8) {
              textSegments.push(cleaned);
            }
          }
        }
      }
      
      // Quick deduplication and combination
      const uniqueSegments = [...new Set(textSegments)]
        .filter(s => s.length >= 5 && s.length <= 300)
        .slice(0, 50); // Keep only best 50
      
      let extractedText = uniqueSegments.join(' ').trim();
      
      // Simple final cleanup
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\.\s+\./g, '.')
        .trim();
      
      // Limit length to prevent large responses
      if (extractedText.length > 8000) {
        extractedText = extractedText.substring(0, 8000) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`Extraction completed in ${processingTime}ms, text length: ${extractedText.length}`);
      
      // Quick validation
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite text extraherad (${extractedText.length} tecken). PDF kan vara bildbaserad.`);
      }
      
      const wordCount = extractedText.split(/\s+/).length;
      if (wordCount < 5) {
        throw new Error('För få läsbara ord hittades i PDF:en');
      }
      
      clearTimeout(timeoutId);
      resolve(extractedText);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Extraction error:', error);
      reject(error);
    }
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== PDF EXTRACTION REQUEST ===');
  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Endast POST tillåtet',
          code: 'INVALID_METHOD'
        }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ogiltig JSON',
          code: 'INVALID_JSON'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { pdfUrl, projectId } = requestBody;

    if (!pdfUrl || !projectId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF URL och projekt-ID krävs',
          code: 'MISSING_PARAMS'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Downloading PDF...');
    
    // Quick download with timeout
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfUrl, {
        signal: downloadController.signal,
        headers: { 'User-Agent': 'PDFExtractor/1.0' }
      });
    } catch (error) {
      clearTimeout(downloadTimeout);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Kunde inte ladda ner PDF',
          code: 'DOWNLOAD_FAILED'
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    clearTimeout(downloadTimeout);
    
    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Download fel: ${pdfResponse.status}`,
          code: 'DOWNLOAD_ERROR'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log(`PDF downloaded: ${pdfArrayBuffer.byteLength} bytes`);

    if (pdfArrayBuffer.byteLength === 0) {
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `PDF för stor (${Math.round(pdfArrayBuffer.byteLength / 1024 / 1024)}MB, max ${MAX_PDF_SIZE / 1024 / 1024}MB)`,
          code: 'FILE_TOO_LARGE'
        }),
        { 
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Starting text extraction...');
    
    let extractedText;
    try {
      extractedText = await extractTextFromPDF(pdfArrayBuffer);
    } catch (error) {
      console.error('Extraction failed:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          code: 'EXTRACTION_FAILED'
        }),
        { 
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const processingTime = Date.now() - startTime;
    const wordCount = extractedText.split(/\s+/).length;
    const hasNumbers = /\d/.test(extractedText);
    
    console.log(`SUCCESS: ${extractedText.length} chars, ${wordCount} words, ${processingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: extractedText,
        metadata: {
          length: extractedText.length,
          wordCount: wordCount,
          hasNumbers: hasNumbers,
          hasSwedishChars: /[åäöÅÄÖ]/.test(extractedText),
          hasFinancialTerms: /(omsättning|intäkter|resultat|vinst|förlust|miljoner|mkr|procent|revenue|profit)/i.test(extractedText),
          processingTimeMs: processingTime,
          fileSizeMB: Math.round(pdfArrayBuffer.byteLength / 1024 / 1024 * 100) / 100,
          sample: extractedText.substring(0, 200)
        },
        message: 'Text extraherad framgångsrikt'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('UNEXPECTED ERROR:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Oväntat fel vid PDF-bearbetning',
        code: 'UNEXPECTED_ERROR',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
