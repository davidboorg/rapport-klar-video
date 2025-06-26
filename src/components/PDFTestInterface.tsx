
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, CheckCircle, AlertCircle, Settings, Globe, ExternalLink, Copy, AlertTriangle } from 'lucide-react';

const PDFTestInterface: React.FC = () => {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  // ALLTID avstängt för säkerhet
  const useExternalApi = false;
  const testPDFUrl = 'https://www.aikfotboll.se/media/h1dftn03/240212-kallelse-till-a-rssta-mma-i-aik-fotboll-ab.pdf';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: "URL kopierad till urklipp",
    });
  };

  const isTextCorrupt = (text: string): boolean => {
    if (!text || text.length < 10) return false;
    
    const printableChars = text.match(/[a-zA-ZåäöÅÄÖ0-9\s.,!?;:()-]/g)?.length || 0;
    const totalChars = text.length;
    const printableRatio = printableChars / totalChars;
    
    return printableRatio < 0.3;
  };

  const extractWithSupabase = async () => {
    console.log('🎯 SÄKERT: Använder Supabase Edge Function - den fungerande lösningen!');
    setDebugInfo(`🔒 SUPABASE EDGE FUNCTION (SÄKER VÄG)\nPDF URL: ${testPDFUrl}\nTidpunkt: ${new Date().toISOString()}`);
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('📞 Anropar Supabase Edge Function...');
    const { data, error } = await supabase.functions.invoke('extract-pdf-content', {
      body: {
        pdfUrl: testPDFUrl,
        projectId: 'test-project-' + Date.now()
      }
    });

    console.log('🔍 Supabase response data:', data);
    console.log('🔍 Supabase response error:', error);

    if (error) {
      console.error('❌ Supabase Edge Function fel:', error);
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.success) {
      console.error('❌ Edge Function returnerade fel:', data);
      throw new Error(`Extraction failed: ${data?.error || 'Unknown error'}`);
    }

    // KRITISK FIX: Se till att vi använder rätt fält från responsen
    const extractedContent = data.content;
    console.log('✅ Extraherat innehåll typ:', typeof extractedContent);
    console.log('✅ Extraherat innehåll längd:', extractedContent?.length);
    console.log('✅ Första 200 tecken:', extractedContent?.substring(0, 200));

    if (!extractedContent || typeof extractedContent !== 'string') {
      throw new Error('Ingen giltig textinnehåll returnerat från Edge Function');
    }

    // Kontrollera om innehållet är korrupt
    if (isTextCorrupt(extractedContent)) {
      console.error('🚨 Korrupt text upptäckt i Supabase response!');
      throw new Error('Supabase Edge Function returnerade korrupt data - detta borde inte hända!');
    }

    console.log('✅ Supabase Edge Function lyckades med ren text!');
    setDebugInfo(prev => prev + `\n✅ Supabase Edge Function lyckades!\nText längd: ${extractedContent.length}\nProcessing tid: ${data.metadata?.processingTimeMs || 'okänd'}ms\nTyp: ${typeof extractedContent}\nÄr korrupt: ${isTextCorrupt(extractedContent) ? 'JA' : 'NEJ'}`);

    return {
      text: extractedContent,
      metadata: data.metadata
    };
  };

  const extractPDFText = async () => {
    setIsLoading(true);
    setError('');
    setExtractedText('');
    setMetadata(null);
    setDebugInfo('');

    try {
      console.log('🔒 SÄKERHETSLÄGE: Använder ENDAST Supabase Edge Function');
      console.log('📄 PDF URL (ÖPPEN AIK PDF):', testPDFUrl);
      
      const result = await extractWithSupabase();

      console.log('🔍 Final result type:', typeof result.text);
      console.log('🔍 Final result length:', result.text?.length);
      console.log('🔍 Is result corrupt?', isTextCorrupt(result.text));

      if (isTextCorrupt(result.text)) {
        throw new Error('🚨 Extraherad text verkar vara korrupt eller oläsbar. PDF-extraktionen misslyckades.');
      }

      setExtractedText(result.text);
      setMetadata(result.metadata);
      
      toast({
        title: "PDF Extraction Successful!",
        description: `Extracted ${result.metadata?.wordCount || 'unknown'} words from ÖPPEN AIK PDF using SUPABASE.`,
      });

    } catch (err) {
      console.error('💥 PDF extraction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityBadge = () => {
    if (!metadata) return null;
    
    const { wordCount = 0, hasNumbers, hasFinancialTerms } = metadata;
    
    if (wordCount > 100 && hasNumbers && hasFinancialTerms) {
      return <Badge className="bg-green-100 text-green-700">Utmärkt kvalitet</Badge>;
    } else if (wordCount > 50 && (hasNumbers || hasFinancialTerms)) {
      return <Badge className="bg-blue-100 text-blue-700">Bra kvalitet</Badge>;
    } else if (wordCount > 20) {
      return <Badge className="bg-yellow-100 text-yellow-700">Godkänd kvalitet</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Låg kvalitet</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Show corruption warning if text looks garbled */}
      {extractedText && isTextCorrupt(extractedText) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              🚨 Korrupt Text Upptäckt!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-red-700">
                Den extraherade texten verkar vara korrupt eller oläsbar. Detta skulle inte hända med Supabase Edge Function.
              </p>
              <div className="p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 font-medium mb-2">✅ Detta är konstigt:</p>
                <div className="space-y-2">
                  <p className="text-green-700 text-sm">
                    Supabase Edge Function fungerar normalt perfekt och extraherar ren text. 
                    Om du ser detta med Supabase aktiverat, kontakta support.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            🔒 SÄKERHETSLÄGE: Endast Supabase Edge Function
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-100 border border-blue-300 rounded">
            <p className="text-blue-800 font-bold text-lg mb-2">
              🛡️ SÄKERHETSINFO: Externa API är PERMANENT BLOCKERAT
            </p>
            <p className="text-blue-700 text-sm">
              Systemet använder endast den säkra Supabase Edge Function för att förhindra korrupt data.
            </p>
          </div>

          <div className="p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm font-medium text-green-800 mb-2">✅ Supabase Edge Function Status:</p>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>✅ Ska fungera perfekt:</strong> Extrahera ren text från PDF
              </div>
              <div>
                <strong>✅ Snabb processing:</strong> Under 1 sekund
              </div>
              <div>
                <strong>✅ ÖPPEN PDF:</strong> AIK Fotboll utan auth
              </div>
              <div>
                <strong>🔒 Säker:</strong> Ingen korrupt data ska returneras
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-100 border border-blue-300 rounded">
            <p className="text-sm font-medium text-blue-800 mb-2">📄 ÖPPEN PDF (Ingen Auth krävs):</p>
            <div className="bg-white p-2 rounded font-mono text-xs break-all text-blue-700">
              {testPDFUrl}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ✅ AIK Fotboll offentlig PDF - Kallelse till årsstämma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information Card */}
      {debugInfo && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="w-5 h-5" />
              Debug Information - 🔒 SÄKERHETSLÄGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-3 rounded border font-mono whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* PDF Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Extraction Test - 🔒 SÄKER SUPABASE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium mb-1">Test PDF (ÖPPEN - Ingen Auth):</p>
            <p className="text-xs text-gray-600 break-all">
              AIK Fotboll - Kallelse till årsstämma 2024
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✅ Offentligt tillgänglig PDF från aikfotboll.se
            </p>
          </div>

          <Button 
            onClick={extractPDFText} 
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extraherar PDF med SÄKER Supabase Edge Function...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                🔒 Testa SÄKER Supabase Edge Function (DEBUGGAD VERSION)
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Fel vid extraktion:</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {metadata && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">🔒 SÄKER Supabase Extraktion lyckades!</span>
                </div>
                {getQualityBadge()}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tecken:</span>
                  <p className="text-gray-600">{metadata.length || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Ord:</span>
                  <p className="text-gray-600">{metadata.wordCount || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Siffror:</span>
                  <p className="text-gray-600">{metadata.hasNumbers ? '✓' : '✗'}</p>
                </div>
                <div>
                  <span className="font-medium">Finanstermer:</span>
                  <p className="text-gray-600">{metadata.hasFinancialTerms ? '✓' : '✗'}</p>
                </div>
              </div>
            </div>
          )}

          {extractedText && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Extraherad text från 🔒 SÄKER Supabase + ÖPPEN PDF:
              </label>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Extraherad text kommer att visas här..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Visar alla {extractedText.length} tecken från AIK Fotboll PDF via SÄKER Supabase
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTestInterface;
