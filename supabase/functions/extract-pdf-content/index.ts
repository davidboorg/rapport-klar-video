
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants
const MAX_PDF_SIZE = 8 * 1024 * 1024; // 8MB
const EXTRACTION_TIMEOUT = 30000; // 30 seconds
const MIN_TEXT_LENGTH = 200;
const DOWNLOAD_TIMEOUT = 15000; // 15 seconds for download

// Swedish and English financial terms for detection
const FINANCIAL_TERMS = [
  'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT',
  'miljoner', 'mkr', 'msek', 'kvartal', 'procent', 'tillväxt', 'kostnad',
  'rapport', 'period', 'jämfört', 'föregående', 'år', 'månad', 'revenue',
  'profit', 'loss', 'growth', 'quarter', 'million', 'percent', 'compared',
  'previous', 'year', 'month', 'earnings', 'income', 'expenses', 'margin'
];

// Comprehensive metadata and garbage terms to filter out aggressively
const GARBAGE_TERMS = [
  'CreationDate', 'Producer', 'Creator', 'Title', 'Subject', 'Keywords', 'Author', 
  'ModDate', 'FlateDecode', 'BitsPerComponent', 'AppleWebKit', 'Google Docs', 
  'PDF', 'Type', 'Font', 'Encoding', 'Length', 'Filter', 'ColorSpace', 'Width', 
  'Height', 'XObject', 'Resources', 'MediaBox', 'CropBox', 'Rotate', 'Parent', 
  'Kids', 'Count', 'Annots', 'Contents', 'DeviceRGB', 'DeviceCMYK', 'DeviceGray',
  'CalRGB', 'CalGray', 'ICCBased', 'Separation', 'Pattern', 'Indexed', 'Lab',
  'FunctionType', 'Domain', 'Range', 'BBox', 'Matrix', 'XStep', 'YStep',
  'FormType', 'Group', 'CS', 'S', 'BM', 'CA', 'ca', 'SMask', 'AIS', 'TK', 'OPM',
  'op', 'OP', 'SA', 'Microsoft', 'Adobe', 'Acrobat', 'Reader', 'Chrome', 'Safari',
  'Firefox', 'Mozilla', 'Windows', 'KHTML', 'Gecko', 'WebKit', 'Skia',
  'endstream', 'startxref', 'trailer', 'xref', 'obj', 'endobj', 'stream'
];

// Enhanced PDF text extraction with focus on readable content
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  const startTime = Date.now();
  console.log('=== STARTING ROBUST PDF EXTRACTION ===');
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

      // Convert to string for text extraction with multiple encoding attempts
      let pdfText: string;
      try {
        // Try UTF-8 first
        pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      } catch (error) {
        try {
          // Fall back to latin1
          pdfText = new TextDecoder('latin1', { fatal: false }).decode(pdfBytes);
        } catch (error2) {
          // Final fallback to ascii
          pdfText = new TextDecoder('ascii', { fatal: false }).decode(pdfBytes);
        }
      }
      
      let extractedSegments: string[] = [];
      
      console.log('Starting content-focused text extraction...');
      
      // STRATEGY 1: Look for text between parentheses (common PDF text storage)
      console.log('Strategy 1 - Parentheses text extraction...');
      const parenthesesPattern = /\(([^)]{10,200})\)/g;
      const parenthesesMatches = Array.from(pdfText.matchAll(parenthesesPattern));
      
      for (const match of parenthesesMatches.slice(0, 200)) {
        let text = match[1];
        if (!text) continue;
        
        // Clean and validate text
        text = cleanExtractedText(text);
        if (isValidText(text)) {
          extractedSegments.push(text);
        }
      }
      
      console.log(`Found ${extractedSegments.length} segments from parentheses extraction`);
      
      // STRATEGY 2: Look for text in stream content blocks
      console.log('Strategy 2 - Stream content extraction...');
      const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
      const streamMatches = Array.from(pdfText.matchAll(streamPattern));
      
      for (const streamMatch of streamMatches.slice(0, 50)) {
        const streamContent = streamMatch[1];
        if (!streamContent) continue;
        
        // Look for readable text patterns in stream
        const readablePattern = /[a-zA-ZåäöÅÄÖ\s]{15,150}/g;
        const readableMatches = Array.from(streamContent.matchAll(readablePattern));
        
        for (const textMatch of readableMatches.slice(0, 20)) {
          let text = textMatch[0];
          text = cleanExtractedText(text);
          if (isValidText(text)) {
            extractedSegments.push(text);
          }
        }
      }
      
      console.log(`Total segments after stream extraction: ${extractedSegments.length}`);
      
      // STRATEGY 3: Look for text around financial terms
      console.log('Strategy 3 - Financial context extraction...');
      for (const term of FINANCIAL_TERMS.slice(0, 15)) {
        const contextPattern = new RegExp(`(.{20,300}\\b${term}\\b.{20,300})`, 'gi');
        const contextMatches = Array.from(pdfText.matchAll(contextPattern));
        
        for (const contextMatch of contextMatches.slice(0, 10)) {
          let text = contextMatch[1];
          text = cleanExtractedText(text);
          if (isValidText(text) && text.length > 30) {
            extractedSegments.push(text);
          }
        }
      }
      
      console.log(`Total segments after financial extraction: ${extractedSegments.length}`);
      
      // STRATEGY 4: Look for line-based content
      console.log('Strategy 4 - Line-based extraction...');
      const lines = pdfText.split(/\n|\r\n|\r/);
      for (const line of lines.slice(0, 500)) {
        let cleanLine = cleanExtractedText(line);
        if (isValidText(cleanLine) && cleanLine.length > 20) {
          extractedSegments.push(cleanLine);
        }
      }
      
      console.log(`Total segments after line extraction: ${extractedSegments.length}`);
      
      // Remove duplicates and filter for quality
      const uniqueSegments = [...new Set(extractedSegments)]
        .filter(segment => {
          // Final quality check
          return segment.length >= 15 && 
                 segment.length <= 500 &&
                 segment.split(/\s+/).length >= 3 &&
                 /[a-zA-ZåäöÅÄÖ]{3,}/.test(segment) &&
                 !isGarbageText(segment);
        })
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
          
          // Then by meaningful content (more words = better)
          return b.split(/\s+/).length - a.split(/\s+/).length;
        })
        .slice(0, 100); // Take best 100 segments
      
      let extractedText = uniqueSegments.join(' ').trim();
      
      // Final cleaning pass
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\.\s+\./g, '.')
        .replace(/,\s+,/g, ',')
        .replace(/\s+([.,!?;:])/g, '$1')
        .trim();
      
      // Limit final text length
      if (extractedText.length > 10000) {
        extractedText = extractedText.substring(0, 10000) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== ROBUST EXTRACTION COMPLETED ===');
      console.log('Unique segments found:', uniqueSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 200 chars):', extractedText.substring(0, 200));
      
      // Quality validation
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
      
      // Validation with improved criteria
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite innehållstext extraherad från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH}). PDF:en kan vara bildbaserad eller skadad.`);
      }
      
      if (wordCount < 20) {
        throw new Error('För få läsbara ord hittades i PDF:en - kontrollera att det är en textbaserad PDF');
      }
      
      // Check if we only got garbage
      const alphaCount = (extractedText.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
      const totalCount = extractedText.replace(/\s/g, '').length;
      const alphaRatio = alphaCount / totalCount;
      
      if (alphaRatio < 0.3) {
        throw new Error('Extraherad text innehåller för många specialtecken - PDF:en kan vara skadad eller kräver OCR');
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

// Helper function to clean extracted text
function cleanExtractedText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') 
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
    .replace(/[^\w\såäöÅÄÖ.,\-\d%€$()!?;:]/g, ' ') // Keep only meaningful characters
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to validate if text is meaningful
function isValidText(text: string): boolean {
  if (!text || text.length < 10) return false;
  
  // Must have letters
  if (!/[a-zA-ZåäöÅÄÖ]{3,}/.test(text)) return false;
  
  // Must have multiple words
  if (text.split(/\s+/).length < 2) return false;
  
  // Check for garbage patterns
  if (isGarbageText(text)) return false;
  
  // Check alpha ratio
  const alphaCount = (text.match(/[a-zA-ZåäöÅÄÖ]/g) || []).length;
  const totalCount = text.replace(/\s/g, '').length;
  const alphaRatio = alphaCount / totalCount;
  
  return alphaRatio > 0.4;
}

// Helper function to detect garbage text
function isGarbageText(text: string): boolean {
  // Check for metadata terms
  if (GARBAGE_TERMS.some(term => text.toLowerCase().includes(term.toLowerCase()))) {
    return true;
  }
  
  // Check for too many special characters in sequence
  if (/[^\w\s]{5,}/.test(text)) return true;
  
  // Check for binary-like patterns
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]{3,}/.test(text)) return true;
  
  // Check for encoded strings
  if (/\\[xuU][0-9a-fA-F]{2,}/.test(text)) return true;
  
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  const startTime = Date.now();
  console.log('=== ROBUST PDF EXTRACTION REQUEST START ===');
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
          'User-Agent': 'ReportFlow-PDFExtractor/8.0',
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

    console.log('=== STARTING ROBUST TEXT EXTRACTION ===');
    
    // Extract text from PDF with robust content-focused strategies
    let extractedText;
    try {
      extractedText = await extractTextFromPDF(pdfArrayBuffer);
    } catch (error) {
      console.error('Text extraction failed:', error);
      
      let statusCode = 500;
      if (error.message.includes('timeout')) {
        statusCode = 504;
      } else if (error.message.includes('För lite') || error.message.includes('För få')) {
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
    
    console.log('=== ROBUST EXTRACTION SUCCESS ===');
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
          sample: extractedText.substring(0, 300)
        },
        message: 'Text framgångsrikt extraherad från PDF med robusta innehållsfokuserade strategier'
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
