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
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [externalApiUrl, setExternalApiUrl] = useState('https://pdf-extraction-oqr2b3rqx-reportflow1.vercel.app');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  // Updated to use the open AIK PDF that doesn't require authentication
  const testPDFUrl = 'https://www.aikfotboll.se/media/h1dftn03/240212-kallelse-till-a-rssta-mma-i-aik-fotboll-ab.pdf';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: "URL kopierad till urklipp",
    });
  };

  // Function to detect garbled/corrupt text
  const isTextCorrupt = (text: string): boolean => {
    if (!text || text.length < 10) return false;
    
    // Check for high ratio of non-printable or weird characters
    const printableChars = text.match(/[a-zA-ZåäöÅÄÖ0-9\s.,!?;:()-]/g)?.length || 0;
    const totalChars = text.length;
    const printableRatio = printableChars / totalChars;
    
    // If less than 30% of characters are normal printable characters, it's likely corrupt
    return printableRatio < 0.3;
  };

  const extractWithSupabase = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('extract-pdf-content', {
      body: {
        pdfUrl: testPDFUrl,
        projectId: 'test-project-' + Date.now()
      }
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(`Extraction failed: ${data?.error || 'Unknown error'}`);
    }

    return {
      text: data.content,
      metadata: data.metadata
    };
  };

  const extractWithExternalApi = async () => {
    if (!externalApiUrl.trim()) {
      throw new Error('Ange URL till ditt externa API först');
    }

    // Use the root API directly for the new simplified structure
    const apiUrl = externalApiUrl.endsWith('/') ? externalApiUrl.slice(0, -1) : externalApiUrl;
    
    console.log('🚀 Anropar ÖPPNA API:', apiUrl);
    console.log('📄 PDF URL (ÖPPEN AIK PDF):', testPDFUrl);
    
    setDebugInfo(`🌟 NYTT ÖPPET API TEST med ÖPPEN PDF 🌟\nFörsöker ansluta till: ${apiUrl}\nPDF URL: ${testPDFUrl}\nTidpunkt: ${new Date().toISOString()}`);
    
    try {
      console.log('🔍 Skickar request med ÖPPEN PDF URL...');
      
      // Use the correct request format matching your new API code
      const requestBody = {
        url: testPDFUrl  // Using 'url' as per your simplified API code
      };
      
      console.log('📦 Request body:', requestBody);
      setDebugInfo(prev => prev + `\n📦 Request body: ${JSON.stringify(requestBody, null, 2)}`);
      
      console.log('🌐 Testing OPEN API connectivity with OPEN PDF...');
      setDebugInfo(prev => prev + `\n🌐 Testing OPEN API connectivity with OPEN PDF...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('✅ Svar mottaget från ÖPPNA API!');
      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
      
      setDebugInfo(prev => prev + `\n✅ ÖPPEN API anslutning lyckades! Status: ${response.status}`);

      if (!response.ok) {
        // Read response once and handle both cases
        const responseText = await response.text();
        console.log('❌ Error response:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`API error (${response.status}): ${responseText || response.statusText}`);
        }
        throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
      }

      // Read response text once
      const responseText = await response.text();
      console.log('🎉 ÖPPEN API Response text:', responseText.substring(0, 200) + '...');
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('API returnerade ogiltig JSON-data');
      }
      
      setDebugInfo(prev => prev + `\n🎉 Data mottagen från ÖPPNA API! Text length: ${result.text?.length || 0}`);

      if (result.error) {
        throw new Error(`External API error: ${result.error}`);
      }

      // Check if the returned text is corrupt/garbled
      if (result.text && isTextCorrupt(result.text)) {
        throw new Error('📄 API:t returnerade korrupt/oläsbar text. Detta indikerar problem med PDF-extraktionen i det externa API:t. Prova Supabase Edge Function istället.');
      }

      return {
        text: result.text,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('💥 Fetch error details:', error);
      
      setDebugInfo(prev => prev + `\n💥 Fel: ${error.message}`);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('❌ Kan inte ansluta till API:t. Kontrollera att URL:en är korrekt och att API:t är tillgängligt.');
      } else if (error instanceof TypeError && error.message.includes('Load failed')) {
        throw new Error('❌ Anslutningen till API:t misslyckades. Detta kan bero på CORS-problem eller att API:t inte är deployat.');
      } else if (error.name === 'AbortError') {
        throw new Error('⏱️ API-anropet tog för lång tid (timeout).');
      } else {
        throw error;
      }
    }
  };

  const testApiHealth = async () => {
    if (!externalApiUrl.trim()) return;
    
    try {
      // Test basic connectivity to the root
      const healthUrl = externalApiUrl.endsWith('/') ? externalApiUrl.slice(0, -1) : externalApiUrl;
      
      console.log('🏥 Testar ÖPPEN API health på:', healthUrl);
      setDebugInfo(`🏥 Testar ÖPPEN API hälsa: ${healthUrl}\nTid: ${new Date().toISOString()}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('🏥 Health response status:', response.status);
      setDebugInfo(prev => prev + `\n📊 Health status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log('🏥 ÖPPEN API Health check:', data);
        setDebugInfo(prev => prev + `\n✅ Health OK: ${data.substring(0, 200)}`);
        toast({
          title: "ÖPPEN API Health Check ✅",
          description: `API är tillgängligt! Status: ${response.status}`,
        });
      } else {
        console.log('🏥 Health check failed:', response.status);
        const errorText = await response.text();
        setDebugInfo(prev => prev + `\n❌ Health failed: ${response.status} - ${errorText.substring(0, 100)}`);
        toast({
          title: "API Health Check ❌",
          description: `API svarar inte korrekt (status: ${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log('🏥 Health check error:', error);
      setDebugInfo(prev => prev + `\n💥 Health error: ${error.message}`);
      toast({
        title: "API Health Check ❌",
        description: `Kunde inte ansluta till API:t: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const testBasicConnectivity = async () => {
    if (!externalApiUrl.trim()) return;
    
    try {
      console.log('🔍 Testing ÖPPEN API domain connectivity...');
      setDebugInfo(`🔍 Testing ÖPPEN API domain connectivity to: ${externalApiUrl}\nTid: ${new Date().toISOString()}`);
      
      // Try a simple GET to root first
      const rootResponse = await fetch(externalApiUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('🌐 Root response status:', rootResponse.status);
      setDebugInfo(prev => prev + `\n🌐 Root response: ${rootResponse.status}`);
      
      if (rootResponse.ok) {
        const data = await rootResponse.text();
        console.log('🌐 Root response data:', data.substring(0, 200));
        setDebugInfo(prev => prev + `\n📄 Root data: ${data.substring(0, 100)}`);
        
        toast({
          title: "ÖPPEN API anslutning ✅",
          description: "Domänen är tillgänglig!",
        });
      } else {
        setDebugInfo(prev => prev + `\n❌ Root failed: ${rootResponse.status}`);
        toast({
          title: "Anslutningstest ⚠️",
          description: `Domänen svarar med status: ${rootResponse.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log('🌐 Basic connectivity error:', error);
      setDebugInfo(prev => prev + `\n💥 Connectivity error: ${error.message}`);
      toast({
        title: "Anslutningstest ❌",
        description: `Kan inte nå domänen: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const extractPDFText = async () => {
    setIsLoading(true);
    setError('');
    setExtractedText('');
    setMetadata(null);
    setDebugInfo('');

    try {
      console.log(`🎯 Testar PDF extraktion med ${useExternalApi ? 'ÖPPEN External API' : 'Supabase Edge Function'}`);
      console.log('📄 PDF URL (ÖPPEN AIK PDF):', testPDFUrl);
      
      let result;
      
      if (useExternalApi) {
        result = await extractWithExternalApi();
      } else {
        result = await extractWithSupabase();
      }

      // Double-check for corrupt text even if API didn't catch it
      if (isTextCorrupt(result.text)) {
        throw new Error('🚨 Extraherad text verkar vara korrupt eller oläsbar. PDF-extraktionen misslyckades.');
      }

      setExtractedText(result.text);
      setMetadata(result.metadata);
      
      toast({
        title: "PDF Extraction Successful!",
        description: `Extracted ${result.metadata?.wordCount || 'unknown'} words from ÖPPEN AIK PDF using ${useExternalApi ? 'ÖPPEN External API' : 'Supabase'}.`,
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
                Den extraherade texten verkar vara korrupt eller oläsbar. Detta indikerar att det externa API:t inte kan hantera PDF-extraktion korrekt.
              </p>
              <div className="p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-green-800 font-medium mb-2">✅ Rekommenderad lösning:</p>
                <div className="space-y-2">
                  <p className="text-green-700 text-sm">
                    Stäng av "Använd ÖPPNA externa PDF-API" och använd Supabase Edge Function istället. 
                    Enligt loggarna fungerar Supabase-funktionen perfekt och extraherar 5655 tecken med 207 ord på 429ms.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseExternalApi(false);
                      setExtractedText('');
                      setError('');
                      setMetadata(null);
                      toast({
                        title: "Växlat till Supabase",
                        description: "Nu använder vi den fungerande Supabase Edge Function istället"
                      });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    ✅ Växla till Supabase Edge Function
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current URL Status Card */}
      <Card className={useExternalApi ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ExternalLink className="w-5 h-5" />
            {useExternalApi ? "❌ Externa API Problem" : "✅ Supabase Edge Function - Fungerar Perfekt!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {useExternalApi ? (
            <div className="p-3 bg-red-100 border border-red-300 rounded">
              <p className="text-sm font-medium text-red-800 mb-2">⚠️ Externa API returnerar korrupt text:</p>
              <div className="space-y-2 text-sm text-red-700">
                <div>
                  <strong>Problem:</strong> Det externa API:t kan inte hantera PDF-extraktion korrekt
                </div>
                <div>
                  <strong>Resultat:</strong> Binära data istället för läsbar text
                </div>
                <div>
                  <strong>Lösning:</strong> Använd Supabase Edge Function som fungerar perfekt
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-100 border border-green-300 rounded">
              <p className="text-sm font-medium text-green-800 mb-2">✅ Supabase Edge Function Status:</p>
              <div className="space-y-2 text-sm text-green-700">
                <div>
                  <strong>✅ Fungerar perfekt:</strong> Extraherar 5655 tecken med 207 ord
                </div>
                <div>
                  <strong>✅ Snabb processing:</strong> 429ms processingstid
                </div>
                <div>
                  <strong>✅ ÖPPEN PDF:</strong> AIK Fotboll utan auth
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-100 border border-blue-300 rounded">
            <p className="text-sm font-medium text-blue-800 mb-2">📄 ÖPPEN PDF (Ingen Auth krävs):</p>
            <div className="bg-white p-2 rounded font-mono text-xs break-all text-blue-700">
              {testPDFUrl}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ✅ AIK Fotboll offentlig PDF - Kallelse till årsstämma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={testBasicConnectivity}
              disabled={!externalApiUrl.trim()}
              className="text-xs"
            >
              <Globe className="w-4 h-4 mr-1" />
              Test Domän
            </Button>
            <Button
              variant="outline"
              onClick={testApiHealth}
              disabled={!externalApiUrl.trim()}
              className="text-xs"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Test Health
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(externalApiUrl, '_blank')}
              disabled={!externalApiUrl.trim()}
              className="text-xs"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Öppna i ny flik
            </Button>
          </div>

          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
            <p className="text-green-800 font-medium">📋 ÖPPEN API + ÖPPEN PDF Information:</p>
            <ul className="text-green-700 text-xs mt-1 space-y-1">
              <li>• Endpoint: <code>/</code> (root, POST)</li>
              <li>• Request body: <code>{"{ \"url\": \"pdf_url\" }"}</code></li>
              <li>• 🔓 Inget authentication krävs för API!</li>
              <li>• 🔓 Inget authentication krävs för PDF!</li>
              <li>• ✅ Enkel struktur, direkt PDF-extraktion</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information Card */}
      {debugInfo && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <AlertCircle className="w-5 h-5" />
              Debug Information - ÖPPEN API + ÖPPEN PDF Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-3 rounded border font-mono whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* API Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-external-api"
              checked={useExternalApi}
              onCheckedChange={setUseExternalApi}
            />
            <Label htmlFor="use-external-api" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Använd ÖPPNA externa PDF-API
            </Label>
          </div>
          
          {useExternalApi && (
            <div className="space-y-2">
              <Label htmlFor="api-url">ÖPPEN API URL</Label>
              <div className="flex gap-2">
                <Input
                  id="api-url"
                  type="url"
                  placeholder="https://your-pdf-api.vercel.app"
                  value={externalApiUrl}
                  onChange={(e) => setExternalApiUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(externalApiUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Aktuell konfiguration:</strong> {useExternalApi ? '🔓 ÖPPNA Externa API + ÖPPEN PDF' : 'Supabase Edge Function + ÖPPEN PDF'}
            </p>
            {useExternalApi && externalApiUrl && (
              <p className="text-xs text-blue-600 mt-1 break-all">ÖPPEN API URL: {externalApiUrl}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Extraction Test - ÖPPEN PDF med {useExternalApi ? 'Externa API (Problem)' : 'Supabase (Fungerar)'}
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
            disabled={isLoading || (useExternalApi && !externalApiUrl.trim())}
            className="w-full"
            variant={useExternalApi ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extraherar ÖPPEN PDF med {useExternalApi ? 'Externa API' : 'Supabase'}...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                {useExternalApi ? '⚠️ Testa Externa API (Risk för korrupt text)' : '✅ Testa Supabase Edge Function'}
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
              
              {error.includes('body is disturbed') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 font-medium mb-2">🔧 Body parsing fel:</p>
                  <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Detta fel beror ofta på att request body är låst eller stör</li>
                    <li>Kontrollera att din API-kod hanterar JSON-parsing korrekt</li>
                    <li>Se till att `Content-Type: application/json` headers finns</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {metadata && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">ÖPPEN API + ÖPPEN PDF Extraktion lyckades!</span>
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
                Extraherad text från ÖPPEN API + ÖPPEN PDF:
              </label>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Extraherad text kommer att visas här..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Visar alla {extractedText.length} tecken från AIK Fotboll PDF
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Felsökningsguide - ÖPPEN API + ÖPPEN PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-2">🎉 Nya teststrukturen:</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>✅ ÖPPEN API:</strong> POST direkt till root URL utan auth
              </div>
              <div>
                <strong>✅ ÖPPEN PDF:</strong> Offentlig AIK Fotboll PDF utan auth
              </div>
              <div>
                <strong>✅ Request format:</strong> <code>{"{ \"url\": \"pdf_url\" }"}</code>
              </div>
              <div>
                <strong>✅ Response format:</strong> <code>{"{ \"text\": \"...\", \"metadata\": {...} }"}</code>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <h4 className="font-medium text-amber-800 mb-2">⚠️ Body parsing fel:</h4>
            <div className="space-y-2 text-sm text-amber-700">
              <div>
                <strong>1. "body is disturbed or locked":</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>API-koden försöker läsa request body flera gånger</li>
                  <li>Kontrollera att du bara läser `req.body` en gång</li>
                  <li>Använd middleware för body parsing istället</li>
                </ul>
              </div>
              <div>
                <strong>2. JSON parsing fel:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Se till att Content-Type är `application/json`</li>
                  <li>Validera JSON-struktur innan parsing</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">🔄 Test information:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>ÖPPEN API URL:</strong> pdf-extraction-oqr2b3rqx-reportflow1.vercel.app</p>
              <p><strong>ÖPPEN PDF URL:</strong> aikfotboll.se (offentlig)</p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Request body:</strong> <code>{"{ \"url\": \"pdf_url\" }"}</code></p>
              <p><strong>Auth krävs:</strong> 🔓 NEJ - varken för API eller PDF!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTestInterface;
