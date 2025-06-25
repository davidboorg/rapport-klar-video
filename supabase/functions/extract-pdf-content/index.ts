
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced constants for better quality extraction
const MAX_PDF_SIZE = 8 * 1024 * 1024; // 8MB
const EXTRACTION_TIMEOUT = 25000; // 25 seconds
const MIN_TEXT_LENGTH = 100;
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds for download
const MAX_PROCESSING_CHARS = 1000000;

// Global financial terms for reuse
const FINANCIAL_TERMS = [
  'omsättning', 'intäkter', 'resultat', 'vinst', 'förlust', 'EBITDA', 'EBIT',
  'miljoner', 'mkr', 'msek', 'kvartal', 'procent', 'tillväxt', 'kostnad',
  'rapport', 'period', 'jämfört', 'föregående', 'år', 'månad'
];

// Metadata and garbage terms to filter out
const METADATA_TERMS = [
  'CreationDate', 'Producer', 'Creator', 'Title', 'Subject', 'Keywords', 'Author', 
  'ModDate', 'FlateDecode', 'BitsPerComponent', 'AppleWebKit', 'Google Docs', 
  'Storytel AB', 'PDF', 'Type', 'Font', 'Encoding', 'Length', 'Filter',
  'ColorSpace', 'Width', 'Height', 'XObject', 'Resources', 'MediaBox',
  'CropBox', 'Rotate', 'Parent', 'Kids', 'Count', 'Annots', 'Contents',
  'DeviceRGB', 'DeviceCMYK', 'DeviceGray', 'CalRGB', 'CalGray', 'ICCBased',
  'Separation', 'Pattern', 'Indexed', 'Lab', 'FunctionType', 'Domain', 'Range',
  'BBox', 'Matrix', 'XStep', 'YStep', 'FormType', 'Group', 'CS', 'S', 'BM',
  'CA', 'ca', 'SMask', 'AIS', 'TK', 'OPM', 'op', 'OP', 'SA', 'SMask',
  'Microsoft', 'Adobe', 'Acrobat', 'Reader', 'Chrome', 'Safari', 'Firefox'
];

// Enhanced PDF text extraction with aggressive metadata filtering
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
      
      console.log('Starting enhanced text extraction with aggressive filtering...');
      
      // STRATEGY 1: Enhanced text operators with metadata filtering
      console.log('Strategy 1 - Enhanced text operators with metadata filtering...');
      const textPatterns = [
        /\(([^)]{20,300})\)\s*(?:Tj|TJ|'|")/g,
        /\[([^\]]{20,300})\]\s*TJ/g,
        /BT\s+([^E]*?)ET/g,
        /\(\s*([^)]{25,250})\s*\)/g
      ];
      
      for (const pattern of textPatterns) {
        const matches = Array.from(pdfText.matchAll(pattern));
        console.log(`Pattern found ${matches.length} matches`);
        
        for (const match of matches.slice(0, 150)) {
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
            .replace(/BT|ET|Tf|Tm|Td|TD|TL|Tr|Ts|Tc|Tw|Tz/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Aggressive metadata filtering
          const isMetadata = METADATA_TERMS.some(term => 
            text.toLowerCase().includes(term.toLowerCase())
          );
          
          // Content quality checks
          const hasLetters = /[a-zA-ZåäöÅÄÖ]{5,}/.test(text);
          const hasMultipleWords = text.split(/\s+/).length >= 3;
          const notJustNumbers = !/^[0-9\.\s\-\+%]+$/.test(text);
          const notAllCaps = text !== text.toUpperCase();
          const hasReasonableLength = text.length >= 20 && text.length <= 500;
          const notJustSpecialChars = /[a-zA-ZåäöÅÄÖ]/.test(text);
          
          if (!isMetadata && hasLetters && hasMultipleWords && notJustNumbers && 
              hasReasonableLength && notJustSpecialChars && notAllCaps) {
            textSegments.push(text);
          }
        }
        
        if (textSegments.length > 30) break;
      }
      
      // STRATEGY 2: Stream content extraction with better filtering
      console.log('Strategy 2 - Stream content extraction...');
      const streamPattern = /stream[\s\n\r]+(.*?)[\s\n\r]+endstream/gs;
      const streamMatches = Array.from(pdfText.matchAll(streamPattern));
      
      for (const streamMatch of streamMatches.slice(0, 30)) {
        let streamContent = streamMatch[1];
        if (!streamContent) continue;
        
        // Look for readable text in streams
        const readableTextPattern = /[a-zA-ZåäöÅÄÖ\s]{30,300}/g;
        const readableTexts = Array.from(streamContent.matchAll(readableTextPattern));
        
        for (const textMatch of readableTexts.slice(0, 15)) {
          const text = textMatch[0]
            .replace(/\s+/g, ' ')
            .trim();
          
          // Filter out metadata
          const isMetadata = METADATA_TERMS.some(term => 
            text.toLowerCase().includes(term.toLowerCase())
          );
          
          if (!isMetadata && text.length > 25 && text.length < 400 &&
              text.split(/\s+/).length >= 4 &&
              /[a-zA-ZåäöÅÄÖ]{4,}/.test(text)) {
            textSegments.push(text);
          }
        }
        
        if (textSegments.length > 50) break;
      }
      
      // STRATEGY 3: Financial context extraction
      console.log('Strategy 3 - Financial context extraction...');
      
      for (const term of FINANCIAL_TERMS) {
        const termRegex = new RegExp(`(.{30,400}\\b${term}\\b.{30,400})`, 'gi');
        const termMatches = Array.from(pdfText.matchAll(termRegex));
        
        for (const termMatch of termMatches.slice(0, 8)) {
          let context = termMatch[1]
            .replace(/[^\w\såäöÅÄÖ.,\-\d%€$]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Filter out metadata
          const isMetadata = METADATA_TERMS.some(term => 
            context.toLowerCase().includes(term.toLowerCase())
          );
          
          if (!isMetadata && context.length > 40 && context.length < 500 &&
              context.split(/\s+/).length >= 6) {
            textSegments.push(context);
          }
        }
        
        if (textSegments.length > 60) break;
      }
      
      // STRATEGY 4: Line-based extraction with better filtering
      console.log('Strategy 4 - Line-based extraction...');
      const lines = pdfText.split(/\n|\r\n|\r/);
      for (const line of lines.slice(0, 300)) {
        const cleanLine = line
          .replace(/[^\w\såäöÅÄÖ.,\-\d%€$()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Filter out metadata
        const isMetadata = METADATA_TERMS.some(term => 
          cleanLine.toLowerCase().includes(term.toLowerCase())
        );
        
        if (!isMetadata && cleanLine.length > 25 && cleanLine.length < 300 &&
            cleanLine.split(/\s+/).length >= 4 &&
            /[a-zA-ZåäöÅÄÖ]{4,}/.test(cleanLine) &&
            cleanLine !== cleanLine.toUpperCase() &&
            !/^[0-9\.\s\-\+%]+$/.test(cleanLine)) {
          textSegments.push(cleanLine);
        }
        
        if (textSegments.length > 80) break;
      }
      
      // Combine and clean all extracted segments
      console.log('Combining and cleaning extracted segments...');
      
      // Remove duplicates and sort by relevance
      const uniqueSegments = [...new Set(textSegments)]
        .filter(segment => {
          // Final quality filter
          const words = segment.split(/\s+/);
          const hasGoodLength = segment.length >= 25 && segment.length <= 400;
          const hasEnoughWords = words.length >= 4;
          const hasLetters = /[a-zA-ZåäöÅÄÖ]{4,}/.test(segment);
          const notAllCaps = segment !== segment.toUpperCase();
          const notJustNumbers = !/^[0-9\.\s\-\+%]+$/.test(segment);
          
          return hasGoodLength && hasEnoughWords && hasLetters && notAllCaps && notJustNumbers;
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
          
          // Then by word count (more words often better for context)
          const aWords = a.split(/\s+/).length;
          const bWords = b.split(/\s+/).length;
          
          return bWords - aWords;
        })
        .slice(0, 150); // Take best 150 segments
      
      extractedText = uniqueSegments.join(' ').trim();
      
      // Final cleaning
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\.\s+\./g, '.')
        .replace(/,\s+,/g, ',')
        .trim();
      
      // Limit final text length but be more generous
      if (extractedText.length > 8000) {
        extractedText = extractedText.substring(0, 8000) + '...';
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log('=== ENHANCED EXTRACTION COMPLETED ===');
      console.log('Text segments found:', uniqueSegments.length);
      console.log('Final text length:', extractedText.length);
      console.log('Processing time:', processingTime, 'ms');
      console.log('Sample text (first 300 chars):', extractedText.substring(0, 300));
      
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
      
      // More relaxed validation for better success rate
      if (extractedText.length < MIN_TEXT_LENGTH) {
        throw new Error(`För lite innehållstext extraherad från PDF:en (${extractedText.length} tecken, minimum ${MIN_TEXT_LENGTH}). PDF:en kan vara bildbaserad eller innehålla huvudsakligen metadata.`);
      }
      
      if (wordCount < 15) {
        throw new Error('För få läsbara ord hittades i PDF:en - kontrollera att det är en textbaserad PDF med faktiskt innehåll');
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
          'User-Agent': 'ReportFlow-PDFExtractor/7.0',
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
          sample: extractedText.substring(0, 300)
        },
        message: 'Text framgångsrikt extraherad från PDF med avancerade strategier och metadatafiltrering'
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
