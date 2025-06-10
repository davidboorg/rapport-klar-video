
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialData {
  revenue?: string;
  ebitda?: string;
  net_income?: string;
  cash_flow?: string;
  growth_percentage?: string;
  quarter_over_quarter?: string;
  key_highlights?: string[];
  period?: string;
  company_name?: string;
  currency?: string;
  report_type?: string;
  ceo_quote?: string;
  forward_guidance?: string;
  segment_performance?: string[];
  geographic_breakdown?: string[];
  concerns?: string[];
}

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, projectId } = await req.json();
    
    if (!pdfText || !projectId) {
      throw new Error('PDF text and project ID are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting financial analysis for project:', projectId);
    console.log('PDF text received, length:', pdfText.length, 'characters');
    console.log('PDF text preview:', pdfText.substring(0, 500));

    // STEP 1: Extract financial data with better prompting
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du är en expert på finansiell analys som extraherar exakt information från svenska företagsrapporter. 

VIKTIGT: Svara med ENDAST giltig JSON, ingen förklarande text.

Analysera den medföljande rapporten och extrahera EXAKT denna information:
- Företagsnamn (sök efter logotyper, rubriker som "RAPPORT", företagsnamn)
- Rapportperiod (Q1, Q2, Q3, Q4, H1, H2, År)
- Nettoomsättning/intäkter med exakt belopp och valuta
- EBITDA med exakt belopp
- Tillväxt i procent jämfört med föregående period
- 3-5 viktiga operationella höjdpunkter
- VD-citat eller kommentarer
- Framtidsutsikter eller prognoser

Svara med denna EXAKTA JSON-struktur:
{
  "company_name": "företagsnamn som det står i rapporten",
  "period": "Q1 2025",
  "report_type": "Q1",
  "currency": "SEK",
  "revenue": "6 847 MSEK",
  "ebitda": "2 458 MSEK", 
  "growth_percentage": "9,8%",
  "key_highlights": ["exakt text från rapport", "annan höjdpunkt"],
  "ceo_quote": "exakt citat från VD",
  "forward_guidance": "framtidsutsikter som beskrivs"
}`
          },
          {
            role: 'user',
            content: `Analysera denna svenska företagsrapport och extrahera EXAKT finansiell data. Använd de EXAKTA siffrorna från rapporten:\n\n${pdfText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error('OpenAI extraction error:', extractionResponse.status, errorText);
      throw new Error(`OpenAI extraction error: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    const rawContent = extractionData.choices[0].message.content.trim();
    
    console.log('Raw OpenAI extraction response:', rawContent);
    
    let financialData: FinancialData;
    
    try {
      // Parse the JSON response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawContent;
      const cleanedJson = jsonString.replace(/```json\n?|\n?```/g, '').trim();
      
      financialData = JSON.parse(cleanedJson);
      console.log('Successfully parsed financial data:', financialData);
      
    } catch (parseError) {
      console.error('Failed to parse financial data JSON:', parseError);
      console.log('Raw content that failed to parse:', rawContent);
      
      // Create fallback data with basic extraction attempt
      financialData = {
        company_name: extractCompanyName(pdfText),
        period: extractPeriod(pdfText),
        report_type: "Q1",
        currency: "SEK",
        revenue: extractRevenue(pdfText),
        ebitda: extractEBITDA(pdfText),
        net_income: "Information saknas",
        cash_flow: "Information saknas",
        growth_percentage: extractGrowth(pdfText),
        quarter_over_quarter: "Information saknas",
        key_highlights: extractHighlights(pdfText),
        ceo_quote: extractCEOQuote(pdfText),
        forward_guidance: extractGuidance(pdfText),
        segment_performance: ["Information extraheras"],
        geographic_breakdown: ["Information extraheras"],
        concerns: ["Information extraheras"]
      };
    }

    console.log('Final financial data:', JSON.stringify(financialData, null, 2));

    // STEP 2: Generate script alternatives
    const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Skapa tre professionella videomanus för svenska företagsrapporter baserat på verkliga finansiella data.

VIKTIGT: Svara med ENDAST giltig JSON.

Skapa TRE olika manus:
1. EXECUTIVE (2 min) - Professionell sammanfattning för ledning
2. INVESTOR (3 min) - Detaljerad analys för investerare  
3. SOCIAL (1 min) - Kortfattad version för sociala medier

Använd EXAKTA siffror från den finansiella datan.

JSON-struktur:
{
  "scripts": [
    {
      "type": "executive",
      "title": "Executive Summary",
      "duration": "2 minuter",
      "script": "komplett manus text",
      "tone": "Professional",
      "key_points": ["punkt1", "punkt2", "punkt3"]
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Skapa tre manus baserat på denna finansiella data:

Företag: ${financialData.company_name}
Period: ${financialData.period}  
Intäkter: ${financialData.revenue}
EBITDA: ${financialData.ebitda}
Tillväxt: ${financialData.growth_percentage}
Höjdpunkter: ${financialData.key_highlights?.join(', ')}
VD-citat: ${financialData.ceo_quote}
Framtidsutsikter: ${financialData.forward_guidance}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!scriptResponse.ok) {
      throw new Error(`Script generation error: ${scriptResponse.status}`);
    }

    const scriptData = await scriptResponse.json();
    const scriptContent = scriptData.choices[0].message.content.trim();
    
    let scripts: ScriptAlternative[] = [];
    
    try {
      const parsedScripts = JSON.parse(scriptContent);
      scripts = parsedScripts.scripts || [];
    } catch (parseError) {
      console.error('Failed to parse scripts:', parseError);
      // Create fallback scripts
      scripts = createFallbackScripts(financialData);
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update project
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        financial_data: financialData,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save financial data');
    }

    // Save scripts
    const { error: contentError } = await supabase
      .from('generated_content')
      .upsert({
        project_id: projectId,
        script_text: scripts[0]?.script || 'Manus genererat',
        script_alternatives: scripts,
        generation_status: 'completed',
        updated_at: new Date().toISOString(),
      });

    if (contentError) {
      console.error('Content creation error:', contentError);
      throw new Error('Failed to save generated scripts');
    }

    console.log('Successfully processed and saved all data');

    return new Response(JSON.stringify({
      success: true,
      financial_data: financialData,
      script_alternatives: scripts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for fallback parsing
function extractCompanyName(text: string): string {
  const matches = text.match(/([A-ZÅÄÖ][A-ZÅÄÖa-zåäö\s]+(?:AB|SVERIGE|GROUP|ASA))/i);
  return matches ? matches[1].trim() : 'Företaget';
}

function extractPeriod(text: string): string {
  const matches = text.match(/(Q[1-4]\s*20\d{2}|H[12]\s*20\d{2}|KVARTAL\s*[1-4])/i);
  return matches ? matches[1] : 'Q1 2025';
}

function extractRevenue(text: string): string {
  const matches = text.match(/(?:nettoomsättning|intäkter|revenue)[:\s]*([0-9\s,]+)\s*(msek|miljoner|mkr)/i);
  return matches ? `${matches[1].trim()} ${matches[2].toUpperCase()}` : 'Information saknas';
}

function extractEBITDA(text: string): string {
  const matches = text.match(/ebitda[:\s]*([0-9\s,]+)\s*(msek|miljoner|mkr)/i);
  return matches ? `${matches[1].trim()} ${matches[2].toUpperCase()}` : 'Information saknas';
}

function extractGrowth(text: string): string {
  const matches = text.match(/(?:tillväxt|ökning)[:\s]*([0-9,]+)%/i);
  return matches ? `${matches[1]}%` : 'Information saknas';
}

function extractHighlights(text: string): string[] {
  const highlights = [];
  if (text.includes('lansering') || text.includes('lanserade')) highlights.push('Nya produktlanseringar');
  if (text.includes('förvärv') || text.includes('acquisition')) highlights.push('Strategiska förvärv');
  if (text.includes('partnerskap') || text.includes('partnership')) highlights.push('Strategiska partnerskap');
  return highlights.length > 0 ? highlights : ['Operationella framsteg under kvartalet'];
}

function extractCEOQuote(text: string): string {
  const matches = text.match(/(?:vd|ceo)[^"]*"([^"]+)"/i);
  return matches ? matches[1] : 'Starkt kvartal med positiv utveckling';
}

function extractGuidance(text: string): string {
  if (text.includes('framtid') || text.includes('prognos') || text.includes('guidance')) {
    return 'Positiva framtidsutsikter och fortsatt tillväxt';
  }
  return 'Fortsatt fokus på tillväxt och lönsamhet';
}

function createFallbackScripts(data: FinancialData): ScriptAlternative[] {
  const company = data.company_name || 'Företaget';
  const period = data.period || 'kvartalet';
  const revenue = data.revenue || 'starka intäkter';
  const ebitda = data.ebitda || 'solid lönsamhet';
  const growth = data.growth_percentage || 'positiv utveckling';

  return [
    {
      type: 'executive',
      title: 'Executive Summary',
      duration: '2 minuter',
      script: `Jag presenterar ${company}s resultat för ${period}. Vi rapporterar ${revenue} och ${ebitda}, vilket representerar ${growth}. ${data.key_highlights?.[0] || 'Vi har uppnått viktiga milstolpar'} under perioden. ${data.forward_guidance || 'Vi ser positivt på framtiden'}.`,
      tone: 'Professional',
      key_points: ['Stark finansiell prestation', 'Operationella framsteg', 'Positiva framtidsutsikter']
    },
    {
      type: 'investor',
      title: 'Investor Focus',
      duration: '3 minuter',
      script: `Välkomna till ${company}s investerarpresentation för ${period}. Intäkterna uppgick till ${revenue} med ${ebitda} i EBITDA, vilket ger en tillväxt på ${growth}. ${data.ceo_quote || 'Ledningen är nöjd med utvecklingen'}. ${data.forward_guidance || 'Vi fortsätter att fokusera på lönsam tillväxt'}.`,
      tone: 'Analytical',
      key_points: ['Detaljerade finansiella resultat', 'Marknadsposition', 'Strategisk riktning']
    },
    {
      type: 'social',
      title: 'Social Media',
      duration: '1 minut',
      script: `Stolta över ${company}s resultat för ${period}! ${revenue} och ${growth} tillväxt visar på vår starka utveckling. ${data.key_highlights?.[0] || 'Spännande utveckling'} under kvartalet. Framtiden ser ljus ut!`,
      tone: 'Dynamic',
      key_points: ['Starka resultat', 'Positiv utveckling', 'Framtidsoptimism']
    }
  ];
}
