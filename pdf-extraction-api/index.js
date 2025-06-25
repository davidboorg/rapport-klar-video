
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration for Vercel
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://lovableproject.com',
    /\.lovableproject\.com$/,
    'https://pdf-extraction-api-gamma.vercel.app',
    'https://pdf-extraction-oi1ur38qz-reportflow1.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
  next();
});

// Configuration
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const MIN_TEXT_LENGTH = 10;

// Helper function to download PDF with timeout
async function downloadPDF(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PDFExtractor/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    
    if (buffer.length > MAX_PDF_SIZE) {
      throw new Error(`PDF too large: ${Math.round(buffer.length / 1024 / 1024)}MB (max 50MB)`);
    }
    
    return buffer;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Root endpoint for basic testing
app.get('/', (req, res) => {
  res.json({
    status: 'PDF Extraction API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      extract: '/extract'
    },
    timestamp: new Date().toISOString()
  });
});

// Main extraction endpoint
app.post('/extract', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { pdfUrl } = req.body;
    
    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing pdfUrl parameter'
      });
    }
    
    console.log(`[${new Date().toISOString()}] Starting extraction for: ${pdfUrl}`);
    
    // Download PDF
    let buffer;
    try {
      buffer = await downloadPDF(pdfUrl);
      console.log(`Downloaded PDF: ${Math.round(buffer.length / 1024)}KB`);
    } catch (error) {
      console.error('Download failed:', error.message);
      return res.status(400).json({
        success: false,
        error: `Failed to download PDF: ${error.message}`
      });
    }
    
    // Extract text
    let data;
    try {
      data = await pdf(buffer, {
        // PDF-parse options for better extraction
        normalizeWhitespace: true,
        disableCombineTextItems: false
      });
    } catch (error) {
      console.error('PDF parsing failed:', error.message);
      return res.status(422).json({
        success: false,
        error: `Failed to parse PDF: ${error.message}`
      });
    }
    
    const extractedText = data.text?.trim() || '';
    
    if (!extractedText || extractedText.length < MIN_TEXT_LENGTH) {
      return res.status(422).json({
        success: false,
        error: `No readable text found in PDF (extracted ${extractedText.length} characters)`
      });
    }
    
    const processingTime = Date.now() - startTime;
    const wordCount = extractedText.split(/\s+/).length;
    
    // Check for financial terms and numbers (quality indicators)
    const hasNumbers = /\d/.test(extractedText);
    const financialTerms = ['revenue', 'profit', 'loss', 'income', 'costs', 'expenses', 'investment', 'equity', 'debt', 'assets', 'liabilities', 'cash flow', 'earnings', 'dividend', 'quarter', 'annual', 'budget', 'forecast', 'margin', 'growth', 'intäkter', 'vinst', 'förlust', 'kostnader', 'utgifter', 'investering', 'skuld', 'tillgångar', 'kassaflöde', 'utdelning', 'kvartal', 'årlig', 'budget', 'prognos', 'marginal', 'tillväxt'];
    const hasFinancialTerms = financialTerms.some(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log(`Extraction successful: ${extractedText.length} chars, ${wordCount} words, ${processingTime}ms`);
    
    return res.json({
      success: true,
      text: extractedText,
      metadata: {
        length: extractedText.length,
        wordCount: wordCount,
        pages: data.numpages || 0,
        processingTimeMs: processingTime,
        fileSizeKB: Math.round(buffer.length / 1024),
        hasNumbers,
        hasFinancialTerms
      }
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Unexpected error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error during PDF extraction',
      processingTimeMs: processingTime
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'vercel'
  });
});

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PDF Extraction API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Extract endpoint: POST http://localhost:${PORT}/extract`);
  });
}

module.exports = app;
