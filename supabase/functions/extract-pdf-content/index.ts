
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Förbättrad funktion för att extrahera finansiell text från PDF
const extractFinancialContent = (text: string): string => {
  console.log('Extracting financial content from text of length:', text.length);
  
  // Rensa bort kontrolltecken och onödiga symboler
  let cleanedText = text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Ta bort kontrolltecken
    .replace(/[^\w\säöåÄÖÅ.,%-]/g, ' ')    // Behåll bara text, siffror och viktig punktuation
    .replace(/\s+/g, ' ')                   // Normalisera whitespace
    .trim();

  // Sök efter finansiella nyckelord på svenska och engelska
  const financialKeywords = [
    'omsättning', 'intäkter', 'revenue', 'turnover',
    'rörelseresultat', 'EBIT', 'operating result',
    'nettoresultat', 'nettovinst', 'net income', 'profit',
    'MSEK', 'MEUR', 'miljoner', 'million',
    'kvartal', 'Q1', 'Q2', 'Q3', 'Q4',
    'tillväxt', 'growth', 'procent', '%',
    'balansomslutning', 'total assets',
    'eget kapital', 'equity',
    'skulder', 'liabilities',
    'kassaflöde', 'cash flow'
  ];

  // Dela upp i meningar och hitta relevanta stycken
  const sentences = cleanedText.split(/[.!?]+/).filter(s => s.length > 20);
  const relevantSentences: string[] = [];
  
  // Första passningen: hitta meningar med finansiella nyckelord
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const keywordMatches = financialKeywords.filter(keyword => 
      lowerSentence.includes(keyword.toLowerCase())
    ).length;
    
    // Lägg till meningar som innehåller finansiella nyckelord OCH siffror
    if (keywordMatches >= 1 && /\d+/.test(sentence)) {
      relevantSentences.push(sentence.trim());
    }
    
    // Stoppa när vi har tillräckligt med innehåll
    if (relevantSentences.length >= 15) break;
  }

  // Om vi inte hittar tillräckligt, försök hitta paragrafer med siffror
  if (relevantSentences.length < 5) {
    console.log('Limited financial sentences found, expanding search...');
    
    // Dela upp i större stycken och sök efter numeriska data
    const paragraphs = cleanedText.split(/\n\s*\n/).filter(p => p.length > 50);
    
    for (const paragraph of paragraphs) {
      // Leta efter stycken med många siffror (troligen tabeller eller finansdata)
      const numberMatches = paragraph.match(/\d+[.,]?\d*/g) || [];
      if (numberMatches.length >= 3) {
        relevantSentences.push(paragraph.trim());
      }
      
      if (relevantSentences.length >= 10) break;
    }
  }

  let extractedContent = '';
  if (relevantSentences.length > 0) {
    extractedContent = relevantSentences.join('. ');
    console.log('Successfully extracted', relevantSentences.length, 'relevant financial sections');
  } else {
    // Sista utvägen: ta första delen av dokumentet om det innehåller siffror
    const firstPart = cleanedText.substring(0, 5000);
    if (/\d+/.test(firstPart)) {
      extractedContent = firstPart;
      console.log('Using first part of document with numbers as fallback');
    } else {
      throw new Error('Inget finansiellt innehåll kunde extraheras från dokumentet. Kontrollera att PDF:en innehåller läsbar text.');
    }
  }

  // Begränsa till 8000 tecken för AI-analys
  return extractedContent.substring(0, 8000);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, projectId } = await req.json();
    
    console.log('Starting enhanced PDF content extraction from:', pdfUrl);

    if (!pdfUrl || !projectId) {
      throw new Error('Missing pdfUrl or projectId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let extractedText = '';
    let extractionMethod = 'unknown';

    try {
      console.log('Fetching PDF from URL...');
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
      }

      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');

      // Försök med pdf-parse först
      try {
        const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
        const pdfBuffer = new Uint8Array(pdfArrayBuffer);
        
        const pdfData = await pdfParse.default(pdfBuffer, {
          max: 0,
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        if (pdfData.text && pdfData.text.length > 100) {
          extractedText = pdfData.text;
          extractionMethod = 'pdf-parse';
          console.log('PDF-parse successful, extracted:', extractedText.length, 'characters');
        } else {
          throw new Error('PDF-parse returned insufficient text');
        }

      } catch (parseError) {
        console.log('PDF-parse failed, trying raw text extraction...');
        
        // Alternativ metod: rå textextraktion
        const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
        const rawText = decoder.decode(pdfArrayBuffer);
        
        // Extrahera text från PDF-streams
        const textPatterns = [
          /\(([^)]{10,})\)/g,  // Text inom parenteser
          /BT\s+([^ET]+)ET/g,  // Text mellan BT och ET
          /Tj\s*\[\s*\(([^)]+)\)/g  // Tj-kommandon
        ];
        
        let extractedParts: string[] = [];
        
        for (const pattern of textPatterns) {
          const matches = rawText.match(pattern) || [];
          extractedParts = extractedParts.concat(
            matches.map(match => match.replace(/[()]/g, '').trim())
                  .filter(text => text.length > 5 && /[a-öA-Ö]/.test(text))
          );
        }
        
        if (extractedParts.length > 0) {
          extractedText = extractedParts.join(' ');
          extractionMethod = 'raw-text-patterns';
          console.log('Raw text extraction successful, found:', extractedParts.length, 'text parts');
        } else {
          throw new Error('Ingen läsbar text hittades i PDF:en');
        }
      }

    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`PDF-extrahering misslyckades: ${error.message}. Kontrollera att filen är en giltig PDF med läsbar text.`);
    }

    // Extrahera finansiellt innehåll från den rena texten
    const financialContent = extractFinancialContent(extractedText);
    
    console.log('Final financial content length:', financialContent.length);
    console.log('Content preview:', financialContent.substring(0, 200));

    // Uppdatera projektstatus
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
        content: financialContent,
        method: extractionMethod,
        length: financialContent.length,
        quality_score: extractionMethod === 'pdf-parse' ? 'high' : 'medium'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in enhanced PDF extraction:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Ett fel uppstod vid PDF-extrahering'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
