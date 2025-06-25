
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, CheckCircle, AlertCircle, Settings, Globe } from 'lucide-react';

const PDFTestInterface: React.FC = () => {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [externalApiUrl, setExternalApiUrl] = useState('');
  const { toast } = useToast();

  const testPDFUrl = 'https://qpveeqvzvukolfagasne.supabase.co/storage/v1/object/sign/project-pdfs/rapport-delarsrapport-januari-mars-2025-250429.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wZjAzZWViNC05ODhhLTQwMTUtOWQ4ZS1iMjY2OGU0NDdiMTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9qZWN0LXBkZnMvcmFwcG9ydC1kZWxhcnNyYXBwb3J0LWphbnVhcmktbWFycy0yMDI1LTI1MDQyOS5wZGYiLCJpYXQiOjE3NTA4NTYyOTMsImV4cCI6MTc1MTQ2MTA5M30.JTE_pzNRZTAH6iyK48PGueAEDKNMkzO52X_EFmBMkAw';

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

    const apiUrl = externalApiUrl.endsWith('/extract') ? externalApiUrl : `${externalApiUrl}/extract`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdfUrl: testPDFUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`External API error: ${result.error || 'Unknown error'}`);
    }

    return {
      text: result.text,
      metadata: result.metadata
    };
  };

  const extractPDFText = async () => {
    setIsLoading(true);
    setError('');
    setExtractedText('');
    setMetadata(null);

    try {
      console.log(`Testing PDF extraction with ${useExternalApi ? 'External API' : 'Supabase Edge Function'}`);
      console.log('PDF URL:', testPDFUrl);
      
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
        description: `Extracted ${result.metadata?.wordCount || 'unknown'} words using ${useExternalApi ? 'External API' : 'Supabase'}.`,
      });

    } catch (err) {
      console.error('PDF extraction error:', err);
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
              Använd externt PDF-API
            </Label>
          </div>
          
          {useExternalApi && (
            <div className="space-y-2">
              <Label htmlFor="api-url">API URL (t.ex. din Vercel deployment)</Label>
              <Input
                id="api-url"
                type="url"
                placeholder="https://your-pdf-api.vercel.app"
                value={externalApiUrl}
                onChange={(e) => setExternalApiUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Exempel: https://pdf-extraction-api.vercel.app
              </p>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Aktuell konfiguration:</strong> {useExternalApi ? 'Externt API' : 'Supabase Edge Function'}
            </p>
            {useExternalApi && externalApiUrl && (
              <p className="text-xs text-blue-600 mt-1">API URL: {externalApiUrl}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Extraction Test
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
                Extraherar PDF med {useExternalApi ? 'Externt API' : 'Supabase'}...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Testa PDF Extraktion
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
              
              {error.includes('CPU Time exceeded') && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Tips:</strong> Detta fel uppstår med Supabase Edge Functions. 
                    Prova att använda det externa API:t istället!
                  </p>
                </div>
              )}
            </div>
          )}

          {metadata && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Extraktion lyckades!</span>
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
              
              {metadata.processingTimeMs && (
                <p className="text-xs text-gray-500 mt-2">
                  Bearbetningstid: {metadata.processingTimeMs}ms
                </p>
              )}
            </div>
          )}

          {extractedText && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Extraherad text:
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

      {/* Deployment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Deployment Instruktioner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Snabb deployment till Vercel:</h4>
            <div className="bg-blue-100 p-2 rounded font-mono text-sm">
              <p>cd pdf-extraction-api</p>
              <p>npm install</p>
              <p>npx vercel --prod</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>🔗 Se <code>pdf-extraction-api/DEPLOYMENT.md</code> för fullständiga instruktioner</p>
            <p>🧪 Testa API:t med <code>npm run test</code> efter deployment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFTestInterface;
