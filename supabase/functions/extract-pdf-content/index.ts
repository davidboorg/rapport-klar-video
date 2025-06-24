
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract text from PDF using a more reliable method
const extractTextFromPDF = async (pdfArrayBuffer: ArrayBuffer): Promise<string> => {
  console.log('Attempting PDF text extraction...');
  
  try {
    // Try pdf2pic/pdf-parse with better configuration
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
    const pdfBuffer = new Uint8Array(pdfArrayBuffer);
    
    const options = {
      pagerender: (pageData: any) => {
        // Custom page rendering to extract text better
        return pageData.getTextContent().then((textContent: any) => {
          return textContent.items.map((item: any) => item.str).join(' ');
        });
      }
    };
    
    const data = await pdfParse.default(pdfBuffer, options);
    
    if (data.text && data.text.length > 50) {
      console.log('PDF-parse successful, text length:', data.text.length);
      return data.text;
    }
    
    throw new Error('PDF-parse returned insufficient text');
    
  } catch (parseError) {
    console.log('PDF-parse failed, trying alternative approach:', parseError);
    
    // Alternative: Use a different PDF parsing approach
    try {
      const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
      const text = decoder.decode(pdfArrayBuffer);
      
      // Look for text patterns in PDF structure
      const textPatterns = [
        /stream\s*(.*?)\s*endstream/gs,
        /BT\s*(.*?)\s*ET/gs,
        /\[(.*?)\]\s*TJ/gs,
        /\((.*?)\)\s*Tj/gs
      ];
      
      let extractedText = '';
      
      for (const pattern of textPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            extractedText += match[1] + ' ';
          }
        }
      }
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\\[rnt]/g, ' ')
        .replace(/[^\x20-\x7E\xC0-\xFF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 100) {
        console.log('Alternative extraction successful, text length:', extractedText.length);
        return extractedText;
      }
      
      throw new Error('Alternative extraction failed');
      
    } catch (altError) {
      console.log('Alternative extraction failed:', altError);
      throw new Error('Could not extract readable text from PDF');
    }
  }
};

// Validate and clean extracted text
const validateAndCleanText = (text: string): string => {
  console.log('Validating extracted text, length:', text.length);
  
  // Remove control characters and normalize whitespace
  let cleanText = text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check if text contains actual readable words
  const wordCount = (cleanText.match(/[a-öA-Ö]{3,}/g) || []).length;
  const numberCount = (cleanText.match(/\d+/g) || []).length;
  
  console.log('Word count:', wordCount, 'Number count:', numberCount);
  
  if (wordCount < 10) {
    throw new Error('PDF innehåller för få läsbara ord. Kontrollera att det är en textbaserad PDF.');
  }
  
  // Look for financial keywords to ensure it's relevant
  const financialKeywords = [
    'kronor', 'mkr', 'msek', 'miljoner', 'miljarder', 
    'omsättning', 'intäkter', 'vinst', 'resultat', 'balans',
    'revenue', 'profit', 'income', 'earnings', 'sek', 'eur', 'usd'
  ];
  
  const hasFinancialContent = financialKeywords.some(keyword => 
    cleanText.toLowerCase().includes(keyword)
  );
  
  if (!hasFinancialContent && numberCount < 5) {
    console.log('Warning: Document may not contain financial data');
  }
  
  // Return the first 8000 characters for AI processing
  const result = cleanText.substring(0, 8000);
  console.log('Final cleaned text length:', result.length);
  
  return result;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, projectId } = await req.json();
    
    console.log('Starting PDF extraction from:', pdfUrl);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Download PDF
    console.log('Downloading PDF...');
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');

    if (pdfArrayBuffer.byteLength === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(pdfArrayBuffer);
    
    // Validate and clean the text
    const cleanedText = validateAndCleanText(extractedText);
    
    console.log('PDF extraction completed successfully');
    console.log('Text preview (first 200 chars):', cleanedText.substring(0, 200));

    // Update project status
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: cleanedText,
        length: cleanedText.length,
        quality: 'high',
        message: 'Text successfully extracted from PDF'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('PDF extraction error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod vid PDF-extrahering',
        details: 'Could not extract readable text from the PDF file'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
