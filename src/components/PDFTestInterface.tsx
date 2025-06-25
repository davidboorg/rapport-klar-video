
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, CheckCircle, AlertCircle, Settings, Globe, ExternalLink, Copy } from 'lucide-react';

const PDFTestInterface: React.FC = () => {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [externalApiUrl, setExternalApiUrl] = useState('https://pdf-extraction-oqr2b3rqx-reportflow1.vercel.app');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  const testPDFUrl = 'https://qpveeqvzvukolfagasne.supabase.co/storage/v1/object/sign/project-pdfs/rapport-delarsrapport-januari-mars-2025-250429.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZjAzZWViNC05ODhhLTQwMTUtOWQ4ZS1iMjY2OGU0NDdiMTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9qZWN0LXBkZnMvcmFwcG9ydC1kZWxhcnNyYXBwb3J0LWphbnVhcmktbWFycy0yMDI1LTI1MDQyOS5wZGYiLCJpYXQiOjE3NTA4NjIzMTAsImV4cCI6MTc1MTQ2NzExMH0.MFM-6gcpFSCqZnoyvB_1Gw6GwTd7zqsyB0SO_sI62Qw';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: "URL kopierad till urklipp",
    });
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
    console.log('📄 PDF URL:', testPDFUrl);
    
    setDebugInfo(`🌟 NYTT ÖPPET API TEST 🌟\nFörsöker ansluta till: ${apiUrl}\nPDF URL: ${testPDFUrl}\nTidpunkt: ${new Date().toISOString()}`);
    
    try {
      console.log('🔍 Skickar request med PDF URL...');
      
      // Use the simplified request format that matches your new API code
      const requestBody = {
        url: testPDFUrl  // Using 'url' as per your new API code
      };
      
      console.log('📦 Request body:', requestBody);
      setDebugInfo(prev => prev + `\n📦 Request body: ${JSON.stringify(requestBody, null, 2)}`);
      
      console.log('🌐 Testing OPEN API connectivity...');
      setDebugInfo(prev => prev + `\n🌐 Testing OPEN API connectivity...`);
      
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
        let errorData;
        try {
          errorData = await response.json();
          console.log('❌ Error data:', errorData);
        } catch (e) {
          const errorText = await response.text();
          console.log('❌ Error text:', errorText);
          throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
        }
        throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('🎉 ÖPPEN API Response data:', result);
      
      setDebugInfo(prev => prev + `\n🎉 Data mottagen från ÖPPNA API! Text length: ${result.text?.length || 0}`);

      if (result.error) {
        throw new Error(`External API error: ${result.error}`);
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
      console.log('📄 PDF URL:', testPDFUrl);
      
      let result;
      
      if (useExternalApi) {
        result = await extractWithExternalApi();
      } else {
        result = await extractWithSupabase();
      }

      setExtractedText(result.text);
      setMetadata(result.metadata);
      
      toast({
        title: "PDF Extraction Successful!",
        description: `Extracted ${result.metadata?.wordCount || 'unknown'} words using ${useExternalApi ? 'ÖPPEN External API' : 'Supabase'}.`,
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
      {/* Current URL Status Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <ExternalLink className="w-5 h-5" />
            🌟 ÖPPEN API Status - Nu Tillgängligt! 🌟
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm font-medium text-green-800 mb-2">🔓 Öppen API URL (Inget Auth krävs):</p>
            <div className="bg-white p-2 rounded font-mono text-sm flex items-center justify-between">
              <span className="text-green-700 break-all">https://pdf-extraction-oqr2b3rqx-reportflow1.vercel.app</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExternalApiUrl('https://pdf-extraction-oqr2b3rqx-reportflow1.vercel.app');
                  copyToClipboard('https://pdf-extraction-oqr2b3rqx-reportflow1.vercel.app');
                  toast({
                    title: "ÖPPEN API URL uppdaterad!",
                    description: "Det öppna API:t är nu aktivt - inget auth krävs!"
                  });
                }}
                className="bg-green-500 hover:bg-green-600 text-white border-green-500"
              >
                <Copy className="w-4 h-4 mr-1" />
                Använd ÖPPNA API
              </Button>
            </div>
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
            <p className="text-green-800 font-medium">📋 ÖPPEN API Information:</p>
            <ul className="text-green-700 text-xs mt-1 space-y-1">
              <li>• Endpoint: <code>/</code> (root, POST)</li>
              <li>• Request body: <code>{"{ \"url\": \"pdf_url\" }"}</code></li>
              <li>• 🔓 Inget authentication krävs!</li>
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
              Debug Information - ÖPPEN API Test
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
              <strong>Aktuell konfiguration:</strong> {useExternalApi ? '🔓 ÖPPNA Externa API' : 'Supabase Edge Function'}
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
            PDF Extraction Test - ÖPPEN API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium mb-1">Test PDF:</p>
            <p className="text-xs text-gray-600 break-all">
              rapport-delarsrapport-januari-mars-2025-250429.pdf
            </p>
          </div>

          <Button 
            onClick={extractPDFText} 
            disabled={isLoading || (useExternalApi && !externalApiUrl.trim())}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extraherar PDF med {useExternalApi ? 'ÖPPNA External API' : 'Supabase'}...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Testa PDF Extraktion med ÖPPNA API
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
                  <span className="font-medium text-green-800">ÖPPEN API Extraktion lyckades!</span>
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
                Extraherad text från ÖPPEN API:
              </label>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Extraherad text kommer att visas här..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Visar alla {extractedText.length} tecken
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
            Felsökningsguide - ÖPPEN API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-2">🎉 Nya API-strukturen:</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>✅ Enkel struktur:</strong> POST direkt till root URL
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
            <h4 className="font-medium text-blue-800 mb-2">🔄 API information:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Aktuell URL:</strong> pdf-extraction-oqr2b3rqx-reportflow1.vercel.app</p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Request body:</strong> <code>{"{ \"url\": \"pdf_url\" }"}</code></p>
              <p><strong>Auth:</strong> 🔓 Inget krävs!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTestInterface;
