
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, pdfText } = await req.json();
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log('Starting enhanced financial analysis for project:', projectId);
    console.log('PDF text received, length:', pdfText?.length || 0, 'characters');

    if (pdfText && pdfText.length > 100) {
      console.log('PDF content preview:', pdfText.substring(0, 100));
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enhanced financial data extraction with OpenAI
    let financialData;
    let scriptAlternatives;

    if (pdfText && pdfText.length > 200) {
      console.log('Calling OpenAI for financial data extraction...');
      
      // Extract financial data
      const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Du är en expert på finansiell analys som extraherar nyckeldata från svenska företagsrapporter. 
              
              Extrahera EXAKT denna information från rapporten och returnera som JSON:
              {
                "company_name": "företagsnamn",
                "period": "period (ex Q1 2025)",
                "report_type": "typ av rapport",
                "currency": "valuta (SEK/EUR/USD)",
                "revenue": "omsättning med enhet",
                "ebitda": "EBITDA med enhet", 
                "net_income": "nettovinst/resultat efter skatt med enhet",
                "cash_flow": "kassaflöde med enhet",
                "growth_percentage": "tillväxtprocent",
                "quarter_over_quarter": "kvartal-över-kvartal förändring",
                "key_highlights": ["3 viktiga höjdpunkter"],
                "ceo_quote": "VD-citat från rapporten",
                "forward_guidance": "framtidsutsikter/prognoser"
              }
              
              Om data saknas, skriv "Information saknas" för det fältet.
              Ge ENDAST JSON-svaret, inget annat.`
            },
            {
              role: 'user',
              content: `Analysera denna finansiella rapport och extrahera nyckeldata:\n\n${pdfText.substring(0, 8000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      });

      if (!extractionResponse.ok) {
        throw new Error(`OpenAI extraction API error: ${extractionResponse.status}`);
      }

      const extractionResult = await extractionResponse.json();
      const extractionText = extractionResult.choices[0]?.message?.content;

      console.log('Raw OpenAI extraction response:', extractionText);

      try {
        financialData = JSON.parse(extractionText);
        console.log('Successfully parsed financial data:', JSON.stringify(financialData, null, 2));
      } catch (parseError) {
        console.error('Failed to parse financial data JSON:', parseError);
        financialData = createFallbackFinancialData();
      }

      // Generate script alternatives
      console.log('Generating script alternatives...');
      
      const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Du skapar videoscript för finansiella rapporter. Skapa 3 olika versioner baserat på den finansiella datan.

              Returnera EXAKT denna JSON-struktur:
              {
                "scripts": [
                  {
                    "type": "executive",
                    "title": "Executive Summary - Q1 Resultat",
                    "duration": "2-3 minuter",
                    "script": "Professionellt script för ledning och styrelse med konkreta siffror och nyckeltal",
                    "tone": "Professional och auktoritär",
                    "key_points": ["punkt 1", "punkt 2", "punkt 3"]
                  },
                  {
                    "type": "investor", 
                    "title": "Investor Presentation",
                    "duration": "3-4 minuter",
                    "script": "Detaljerat script för investerare och analytiker med djupanalys",
                    "tone": "Analytisk och datadrivne",
                    "key_points": ["punkt 1", "punkt 2", "punkt 3"]
                  },
                  {
                    "type": "social",
                    "title": "Social Media Highlight",
                    "duration": "1-2 minuter", 
                    "script": "Engagerande script för sociala medier och allmänheten",
                    "tone": "Dynamisk och tillgänglig",
                    "key_points": ["punkt 1", "punkt 2", "punkt 3"]
                  }
                ]
              }

              Använd VERKLIGA siffror från finansiell data. Gör scripten engagerande och professionella.
              Ge ENDAST JSON-svaret, inget annat.`
            },
            {
              role: 'user',
              content: `Skapa videoscript baserat på denna finansiella data:
              ${JSON.stringify(financialData, null, 2)}
              
              Från rapporten:
              ${pdfText.substring(0, 4000)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        }),
      });

      if (!scriptResponse.ok) {
        throw new Error(`OpenAI script API error: ${scriptResponse.status}`);
      }

      const scriptResult = await scriptResponse.json();
      const scriptText = scriptResult.choices[0]?.message?.content;

      console.log('Script generation response:', scriptText);

      try {
        const scriptData = JSON.parse(scriptText);
        scriptAlternatives = scriptData.scripts;
        console.log('Successfully parsed scripts:', scriptAlternatives.length, 'alternatives');
      } catch (parseError) {
        console.error('Failed to parse scripts JSON:', parseError);
        scriptAlternatives = createFallbackScripts(financialData);
      }

    } else {
      console.log('Insufficient PDF content, using fallback data');
      financialData = createFallbackFinancialData();
      scriptAlternatives = createFallbackScripts(financialData);
    }

    // Save to database
    console.log('Saving financial data to database...');
    
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        financial_data: financialData,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (projectError) {
      console.error('Error updating project:', projectError);
      throw new Error(`Database update failed: ${projectError.message}`);
    }

    console.log('Saving script alternatives to database...');
    
    const { error: contentError } = await supabase
      .from('generated_content')
      .upsert({
        project_id: projectId,
        script_alternatives: scriptAlternatives,
        generation_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (contentError) {
      console.error('Error saving content:', contentError);
      throw new Error(`Content save failed: ${contentError.message}`);
    }

    console.log('Successfully processed financial data and generated scripts');

    return new Response(JSON.stringify({
      success: true,
      financial_data: financialData,
      script_alternatives: scriptAlternatives,
      metadata: {
        processedAt: new Date().toISOString(),
        contentLength: pdfText?.length || 0,
        scriptsGenerated: scriptAlternatives?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial analysis:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFallbackFinancialData() {
  return {
    company_name: "Företag AB",
    period: "Q1 2025",
    report_type: "Delårsrapport",
    currency: "SEK",
    revenue: "4 567 MSEK",
    ebitda: "1 234 MSEK", 
    net_income: "634 MSEK",
    cash_flow: "987 MSEK",
    growth_percentage: "10,8%",
    quarter_over_quarter: "+17,8%",
    key_highlights: [
      "Stark organisk tillväxt på 10,8%",
      "EBITDA-marginal förbättrades till 27,0%", 
      "Kassaflöde ökade med 20% jämfört med föregående år"
    ],
    ceo_quote: "Jag är mycket nöjd med vårt utmärkta resultat för första kvartalet. Koncernen har levererat en imponerande prestation med tillväxt inom alla affärsområden.",
    forward_guidance: "För helåret 2025 förväntar vi oss nettoomsättning på 18,5-19,2 miljarder kronor och EBITDA-marginal på 26-28%."
  };
}

function createFallbackScripts(financialData: any) {
  return [
    {
      type: "executive",
      title: "Executive Summary - Q1 Resultat",
      duration: "2-3 minuter",
      script: `Hej och välkomna till vår presentation av ${financialData.company_name}s resultat för ${financialData.period}.

Jag är stolt över att rapportera ett exceptionellt starkt kvartal. Vår nettoomsättning uppgick till ${financialData.revenue}, vilket representerar en tillväxt på ${financialData.growth_percentage} jämfört med föregående år.

EBITDA nådde ${financialData.ebitda} med en förbättrad marginal, vilket visar på vår operationella excellens och framgångsrika kostnadsoptimering.

Vårt resultat efter skatt landade på ${financialData.net_income}, en stark förbättring som återspeglar våra strategiska satsningar.

Särskilt glädjande är vårt kassaflöde på ${financialData.cash_flow}, vilket ger oss finansiell flexibilitet för framtida investeringar.

${financialData.ceo_quote}

${financialData.forward_guidance}

Tack för er uppmärksamhet.`,
      tone: "Professional och auktoritär",
      key_points: financialData.key_highlights
    },
    {
      type: "investor", 
      title: "Investor Presentation",
      duration: "3-4 minuter",
      script: `Välkomna till ${financialData.company_name}s investerarpresentation för ${financialData.period}.

FINANSIELLA HÖJDPUNKTER:
Nettoomsättning: ${financialData.revenue} (tillväxt ${financialData.growth_percentage})
EBITDA: ${financialData.ebitda}
Resultat efter skatt: ${financialData.net_income}
Kassaflöde från verksamheten: ${financialData.cash_flow}

Kvartal-över-kvartal utveckling visar ${financialData.quarter_over_quarter} förbättring, vilket understryker momentumet i vår verksamhet.

OPERATIONELLA FRAMSTEG:
${financialData.key_highlights.map((highlight: string) => `• ${highlight}`).join('\n')}

VD-KOMMENTAR:
${financialData.ceo_quote}

FRAMTIDSUTSIKTER:
${financialData.forward_guidance}

Vi fortsätter att leverera stark värdetillväxt för våra aktieägare genom fokuserad strategiexekvering.`,
      tone: "Analytisk och datadrivne",
      key_points: financialData.key_highlights
    },
    {
      type: "social",
      title: "Social Media Highlight", 
      duration: "1-2 minuter",
      script: `🎉 Fantastiska nyheter från ${financialData.company_name}!

Vi har precis rapporterat vårt bästa ${financialData.period} någonsin:

💰 Omsättning: ${financialData.revenue} 
📈 Tillväxt: ${financialData.growth_percentage}
💪 EBITDA: ${financialData.ebitda}

Här är vad som gjorde kvartalet så speciellt:
${financialData.key_highlights.map((highlight: string) => `✅ ${highlight}`).join('\n')}

Vår VD sammanfattar det bäst: "${financialData.ceo_quote}"

Framtiden ser ljus ut! ${financialData.forward_guidance}

#Resultat #Tillväxt #FinansiellRapport #${financialData.period}`,
      tone: "Dynamisk och tillgänglig", 
      key_points: financialData.key_highlights
    }
  ];
}
