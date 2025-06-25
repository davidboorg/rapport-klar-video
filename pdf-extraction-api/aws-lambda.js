
// AWS Lambda handler
const fetch = require('node-fetch');
const pdf = require('pdf-parse');

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const MIN_TEXT_LENGTH = 10;

async function downloadPDF(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PDFExtractor/1.0' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    
    if (buffer.length > MAX_PDF_SIZE) {
      throw new Error(`PDF too large: ${Math.round(buffer.length / 1024 / 1024)}MB`);
    }
    
    return buffer;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

exports.handler = async (event) => {
  const startTime = Date.now();
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    const { pdfUrl } = JSON.parse(event.body || '{}');
    
    if (!pdfUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing pdfUrl parameter'
        })
      };
    }
    
    console.log(`Starting extraction for: ${pdfUrl}`);
    
    // Download PDF
    let buffer;
    try {
      buffer = await downloadPDF(pdfUrl);
      console.log(`Downloaded PDF: ${Math.round(buffer.length / 1024)}KB`);
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Failed to download PDF: ${error.message}`
        })
      };
    }
    
    // Extract text
    let data;
    try {
      data = await pdf(buffer, {
        normalizeWhitespace: true,
        disableCombineTextItems: false
      });
    } catch (error) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Failed to parse PDF: ${error.message}`
        })
      };
    }
    
    const extractedText = data.text?.trim() || '';
    
    if (!extractedText || extractedText.length < MIN_TEXT_LENGTH) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          success: false,
          error: `No readable text found in PDF (${extractedText.length} chars)`
        })
      };
    }
    
    const processingTime = Date.now() - startTime;
    const wordCount = extractedText.split(/\s+/).length;
    
    console.log(`Success: ${extractedText.length} chars, ${wordCount} words, ${processingTime}ms`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: extractedText,
        metadata: {
          length: extractedText.length,
          wordCount: wordCount,
          pages: data.numpages || 0,
          processingTimeMs: processingTime,
          fileSizeKB: Math.round(buffer.length / 1024)
        }
      })
    };
    
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error during PDF extraction'
      })
    };
  }
};
