
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants - much more conservative to avoid timeouts
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const EXTRACTION_TIMEOUT = 15000; // 15 seconds
const MIN_TEXT_LENGTH = 50;
const DOWNLOAD_TIMEOUT = 10000; // 10 seconds

// Simple text extraction for different file types
const extractTextFromFile = async (fileArrayBuffer: ArrayBuffer, fileName: string): Promise<string> => {
  console.log(`Starting extraction for file: ${fileName}`);
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Fil-extraktion timeout - filen är för komplex'));
    }, EXTRACTION_TIMEOUT);

    try {
      const fileBytes = new Uint8Array(fileArrayBuffer);
      const fileExtension = fileName.toLowerCase().split('.').pop();
      
      let extractedText = '';
      
      if (fileExtension === 'pdf') {
        // PDF extraction logic
        const header = new TextDecoder('utf-8', { fatal: false }).decode(fileBytes.slice(0, 8));
        if (!header.startsWith('%PDF')) {
          throw new Error('Inte en giltig PDF-fil');
        }
        
        const pdfText = new TextDecoder('utf-8', { fatal: false }).decode(fileBytes);
        const textSegments: string[] = [];
        
        // Quick parentheses extraction for PDF
        const parenthesesRegex = /\(([^)]{5,200})\)/g;
        let match;
        let iterations = 0;
        const maxIterations = 500;
        
        while ((match = parenthesesRegex.exec(pdfText)) !== null && iterations < maxIterations) {
          iterations++;
          let text = match[1];
          
          if (text.includes('Creator') || text.includes('Producer') || 
              text.includes('Mozilla') || text.includes('Chrome') ||
              text.includes('Google Docs') || text.includes('PDF')) {
            continue;
          }
          
          text = text
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (text.length >= 5 && /[a-zA-ZåäöÅÄÖ]{2,}/.test(text)) {
            textSegments.push(text);
          }
          
          if (textSegments.length >= 100) break;
        }
        
        extractedText = [...new Set(textSegments)]
          .filter(s => s.length >= 5 && s.length <= 300)
          .slice(0, 50)
          .join(' ')
          .trim();
          
      } else if (fileExtension === 'docx') {
        // Word document extraction - basic approach
        console.log('Processing Word document...');
        
        // Convert to text and look for readable content
        const docText = new TextDecoder('utf-8', { fatal: false }).decode(fileBytes);
        
        // Extract text from Word document XML structure
        const textSegments: string[] = [];
        
        // Look for text within <w:t> tags (Word's text elements)
        const wordTextRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
        let match;
        
        while ((match = wordTextRegex.exec(docText)) !== null) {
          const text = match[1]
            .replace(/\s+/g, ' ')
            .trim();
            
          if (text.length >= 3 && /[a-zA-ZåäöÅÄÖ]{2,}/.test(text)) {
            textSegments.push(text);
          }
        }
        
        // If no XML tags found, try simple text extraction
        if (textSegments.length < 5) {
          const readableRegex = /[A-Za-zÅÄÖåäö]{4,}(?:\s+[A-Za-zÅÄÖåäö0-9.,%-]{2,}){1,10}/g;
          const readableMatches = docText.match(readableRegex) || [];
          
          for (const text of readableMatches.slice(0, 100)) {
            if (text.length > 8 && !/^(Creator|Producer|Mozilla|Chrome|Word|Microsoft)/.test(text)) {
              const cleaned = text.replace(/\s+/g, ' ').trim();
              if (cleaned.length >= 8) {
                textSegments.push(cleaned);
              }
            }
          }
        }
        
        extractedText = [...new Set(textSegments)]
          .filter(s => s.length >= 3 && s.length <= 300)
          .slice(0, 100)
          .join(' ')
          .trim();
          
      } else {
        throw new Error(`Filtyp '${fileExtension}' stöds inte. Endast PDF och DOCX-filer är tillåtna.`);
      }
      
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
        throw new Error(`För lite text extraherad (${extractedText.length} tecken). Dokumentet kan vara bildbaserat eller tomt.`);
      }
      
      const wordCount = extractedText.split(/\s+/).length;
      if (wordCount < 5) {
        throw new Error('För få läsbara ord hittades i dokumentet');
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

  console.log('=== DOCUMENT EXTRACTION REQUEST ===');
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

    const { pdfUrl, projectId, fileName } = requestBody;

    if (!pdfUrl || !projectId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dokument URL och projekt-ID krävs',
          code: 'MISSING_PARAMS'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Downloading document: ${fileName || 'unknown'}`);
    
    // Quick download with timeout
    const downloadController = new AbortController();
    const downloadTimeout = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT);
    
    let documentResponse;
    try {
      documentResponse = await fetch(pdfUrl, {
        signal: downloadController.signal,
        headers: { 'User-Agent': 'DocumentExtractor/1.0' }
      });
    } catch (error) {
      clearTimeout(downloadTimeout);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Kunde inte ladda ner dokumentet',
          code: 'DOWNLOAD_FAILED'
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    clearTimeout(downloadTimeout);
    
    if (!documentResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Download fel: ${documentResponse.status}`,
          code: 'DOWNLOAD_ERROR'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const documentArrayBuffer = await documentResponse.arrayBuffer();
    console.log(`Document downloaded: ${documentArrayBuffer.byteLength} bytes`);

    if (documentArrayBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dokumentfilen är tom',
          code: 'EMPTY_FILE'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (documentArrayBuffer.byteLength > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Dokument för stort (${Math.round(documentArrayBuffer.byteLength / 1024 / 1024)}MB, max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
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
      extractedText = await extractTextFromFile(documentArrayBuffer, fileName || 'document');
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
          fileSizeMB: Math.round(documentArrayBuffer.byteLength / 1024 / 1024 * 100) / 100,
          sample: extractedText.substring(0, 200),
          fileType: fileName ? fileName.split('.').pop()?.toLowerCase() : 'unknown'
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
        error: 'Oväntat fel vid dokumentbearbetning',
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
