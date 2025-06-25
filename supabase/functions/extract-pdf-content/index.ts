import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced constants for better quality extraction
const MAX_PDF_SIZE = 8 * 1024 * 1024; // Increased to 8MB
const EXTRACTION_TIMEOUT = 25000; // Increased to 25 seconds
const MIN_TEXT_LENGTH = 100; // Increased minimum text length
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds for download
const MAX_PROCESSING_CHARS = 1000000; // Increased processing limit

// Global financial terms for reuse
const FINANCIAL_TERMS = [
  'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT',
  'miljoner', 'mkr', 'msek', 'kvartal', 'procent', 'tillväxt', 'kostnad',
  'rapport', 'period', 'jämfört', 'föregående', 'år', 'månad'
];

// Enhanced PDF text extraction with multiple strategies
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING ENHANCED PDF EXTRACTION ===');
  console.log('PDF size:', pdfArrayBuffer.byteLength, 'bytes');
  
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`PDF-extraktion timeout efter ${EXTRACTION_TIMEOUT/1000}s`));
    }, EXTRACTION_TIMEOUT);

    try {
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      
      // PDF validation
      const headerBytes = new Uint8Array(pdfArrayBuffer.slice(0, 8));
      const headerString = new TextDecoder('utf-8', { fatal: false }).decode(headerBytes);
      
      if (!headerString.startsWith('%PDF')) {
        throw new Error('Filen är inte en giltig PDF');
      }

      console.log('PDF header validation passed');

      // Convert to string for text extraction
      const processingSize = Math.min(pdfArrayBuffer.byteLength, MAX_PROCESSING_CHARS);
      const limitedBytes = new Uint8Array(pdfArrayBuffer.slice(0, processingSize));
      
      let pdfText: string;
      try {
        pdfText = new TextDecoder('utf-8', { fatal: false }).decode(limitedBytes);
      } catch (error) {
        console.log('UTF-8 failed, trying latin1');
        pdfText = new TextDecoder('latin1', { fatal: false }).decode(limitedBytes);
      }
      
      let extractedText = '';
      let textSegments: string[] = [];
      
      console.log('Starting enhanced text extraction with multiple strategies...');
      
      // STRATEGY 1: Enhanced text operators with broader patterns
      console.log('Strategy 1 - Enhanced text operators...');
      const textPatterns = [
        /\(([^)]{10,200})\)\s*(?:Tj|TJ|'|")/g,  // Standard text operators
        /\[([^\]]{10,200})\]\s*TJ/g,             // Array text operators
        /BT\s+[^E]*?ET/g,                        // Complete text blocks
        /\(\s*([^)]{15,150})\s*\)/g              // General parentheses content
      ];
      
      for (const pattern of textPatterns) {
        const matches = Array.from(pdfText.matchAll(pattern));
        console.log(`Pattern found ${matches.length} matches`);
        
        for (const match of matches.slice(0, 100)) { // Process more matches
          let text = match[1] || match[0];
          if (!text) continue;
          
          // Clean extracted text
          text = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r') 
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .replace(/BT|ET|Tf|Tm|Td|TD/g, ' ') // Remove PDF operators
            .replace(/\s+/g, ' ')
            .trim();
          
          // Filter out metadata and keep meaningful text
          if (text.length >= 10 && 
              !text.match(/^[0-9\.\s\-\+]+$/) && // Not just numbers
              !text.match(/^(CreationDate|Producer|Creator|Title|Subject|Keywords|Author|ModDate|FlateDecode|BitsPerComponent|AppleWebKit|Google Docs|Storytel AB)$/i) && // Not metadata
              text.match(/[a-zA-ZåäöÅÄÖ]{3,}/) && // Contains actual words
              !text.match(/^[A-Z\s]+$/) // Not all caps (likely headers)
          ) {
            textSegments.push(text);
          }
        }
        
        if (textSegments.length > 20) break; // Stop if we have enough content
      }
      
      // STRATEGY 2: Stream content extraction (for modern PDFs)
      console.log('Strategy 2 - Stream content extraction...');
      const streamPattern = /stream[\s\n\r]+(.*?)[\s\n\r]+endstream/gs;
      const streamMatches = Array.from(pdfText.matchAll(streamPattern));
      
      for (const streamMatch of streamMatches.slice(0, 20)) {
        let streamContent = streamMatch[1];
        if (!streamContent) continue;
        
        // Try to decode stream content
        try {
          // Look for readable text in streams
          const readableText = streamContent.match(/[a-zA-ZåäöÅÄÖ\s]{20,}/g);
          if (readableText) {
            for (const text of readableText.slice(0, 10)) {
              const cleanText = text.replace(/\s+/g, ' ').trim();
              if (cleanText.length > 15 && 
                  !cleanText.match(/^[A-Z\s]+$/) &&
                  cleanText.match(/[a-zA-ZåäöÅÄÖ]/)) {
                textSegments.push(cleanText);
              }
            }
          }
        } catch (error) {
          console.log('Stream decode failed:', error.message);
        }
        
        if (textSegments.length > 30) break;
      }
      
      // STRATEGY 3: Financial context extraction (specific to financial reports)
      console.log('Strategy 3 - Financial context extraction...');
      
      for (const term of FINANCIAL_TERMS) {
        const termRegex = new RegExp(`(.{20,200}\\b${term}\\b.{20,200})`, 'gi');
        const termMatches = Array.from(pdfText.matchAll(termRegex));
        
        for (const termMatch of termMatches.slice(0, 5)) {
          let context = termMatch[1]
            .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (context.length > 30 && context.length < 300) {
            textSegments.push(context);
          }
        }
        
        if (textSegments.length > 40) break;
      }
      
      // STRATEGY 4: Line-based extraction (for structured content)
      console.log('Strategy 4 - Line-based extraction...');
      const lines = pdfText.split(/\n|\r\n|\r/);
      for (const line of lines.slice(0, 200)) {
        const cleanLine = line
          .replace(/[^\w\såäöÅÄÖ.,\-\d%€$()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanLine.length > 20 && 
            cleanLine.length < 200 &&
            cleanLine.match(/[a-zA-ZåäöÅÄÖ]{3,}/) &&
            !cleanLine.match(/^[A-Z\s]+$/) &&
            !cleanLine.match(/^[0-9\.\s\-\+%]+$/)) {
          textSegments.push(cleanLine);
        }
        
        if (textSegments.length > 50) break;
      }
      
      // Combine and clean all extracted segments
      console.log('Combining and cleaning extracted segments...');
      
      // Remove duplicates and sort by relevance
      const uniqueSegments = [...new Set(textSegments)]
        .filter(segment => segment.length >= 15)
        .sort((a, b) => {
          // Prioritize segments with financial terms
          const aHasFinancial = FINANCIAL_TERMS.some(term => 
            a.toLowerCase().includes(term.toLowerCase())
          );
          const bHasFinancial = FINANCIAL_TERMS.some(term => 
            b.toLowerCase().includes(term.toLowerCase())
          );
          
          if (aHasFinancial && !bHasFinancial) return -1;
          if (!aHasFinancial && bHasFinancial) return 1;
          
          // Then by length (longer is often better)
          return b.length - a.length;
        })
        .slice(0, 100); // Take best 100 segments
      
      extractedText = uniqueSegments.join(' ').trim();
      
      // Final cleaning
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\.\s+\./g, '.')
        .replace(/,\s+,/g, ',')
        .trim();
      
      // Limit final text length but be more generous
      if (extractedText.length > 5000) {
        extractedText = extractedText.substring(0, 5000) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== ENHANCED EXTRACTION COMPLETED ===');
      console.log('Text segments found:', uniqueSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 200 chars):', extractedText.substring(0, 200));
      
      // Enhanced quality validation
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 1).length;
      const hasNumbers = /\d/.test(extractedText);
      const hasSwedishChars = /[åäöÅÄÖ]/.test(extractedText);
      const hasFinancialTerms = FINANCIAL_TERMS.some(term => 
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
      
      // Relaxed validation for better success rate
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite text extraherad från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH})`);
      }
      
      if (wordCount < 10) {
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
  console.log('=== ENHANCED PDF EXTRACTION REQUEST START ===');
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
    
    // Download PDF with timeout
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ReportFlow-PDFExtractor/6.0',
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

    console.log('=== STARTING ENHANCED TEXT EXTRACTION ===');
    
    // Extract text from PDF with enhanced strategies
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
    const hasFinancialTerms = FINANCIAL_TERMS.some(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    const processingTime = Date.now() - startTime;
    
    console.log('=== ENHANCED EXTRACTION SUCCESS ===');
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
