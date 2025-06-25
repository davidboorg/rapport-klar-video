
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Script {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'visionary' | 'analytical';
}

interface ScriptComparisonStepProps {
  script1: string;
  script2: string;
  onSelectScript: (script: string) => void;
}

const ScriptComparisonStep: React.FC<ScriptComparisonStepProps> = ({ 
  script1, 
  script2, 
  onSelectScript 
}) => {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const { toast } = useToast();

  const scripts: Script[] = [
    {
      id: 'script1',
      title: 'Manus 1: Visionärt & Strategiskt',
      description: 'Fokuserar på framtidsvision, strategiska mål och inspirerande budskap',
      content: script1,
      type: 'visionary'
    },
    {
      id: 'script2', 
      title: 'Manus 2: Analytiskt & Faktabaserat',
      description: 'Betonar siffror, data och konkreta resultat',
      content: script2,
      type: 'analytical'
    }
  ];

  const copyToClipboard = async (content: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedScript(scriptId);
      
      toast({
        title: "Kopierat!",
        description: "Manuset har kopierats till urklipp.",
      });

      setTimeout(() => setCopiedScript(null), 2000);
    } catch (error) {
      toast({
        title: "Kopiering misslyckades",
        description: "Kunde inte kopiera till urklipp.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (scriptId: string) => {
    setExpandedScript(expandedScript === scriptId ? null : scriptId);
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script.id);
    onSelectScript(script.content);
  };

  const getScriptTypeColor = (type: string) => {
    return type === 'visionary' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).length;
  };

  const getPreviewText = (text: string, maxLength: number = 200) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Välj Ditt Manus</CardTitle>
          <p className="text-center text-gray-600">
            AI:n har genererat två olika manus baserat på ditt dokument. Välj det som passar bäst för din presentation.
          </p>
        </CardHeader>
      </Card>

      {/* Desktop: Side by side comparison */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {scripts.map((script) => (
          <Card 
            key={script.id} 
            className={`transition-all duration-200 ${
              selectedScript === script.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{script.title}</CardTitle>
                <Badge className={getScriptTypeColor(script.type)}>
                  {script.type === 'visionary' ? 'Visionärt' : 'Analytiskt'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{script.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{getWordCount(script.content)} ord</span>
                <span>~{Math.ceil(getWordCount(script.content) / 150)} min</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {getPreviewText(script.content, 300)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={selectedScript === script.id ? "default" : "outline"}
                  onClick={() => handleSelectScript(script)}
                  className="flex-1"
                >
                  {selectedScript === script.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Valt
                    </>
                  ) : (
                    'Välj Detta Manus'
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(script.content, script.id)}
                  title="Kopiera manus"
                >
                  {copiedScript === script.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleExpanded(script.id)}
                  title="Visa fulltext"
                >
                  {expandedScript === script.id ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {expandedScript === script.id && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Fulltext:</h4>
                  <Textarea
                    value={script.content}
                    readOnly
                    className="min-h-[200px] text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden space-y-4">
        {scripts.map((script) => (
          <Card 
            key={script.id}
            className={`transition-all duration-200 ${
              selectedScript === script.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{script.title}</CardTitle>
                <Badge className={getScriptTypeColor(script.type)}>
                  {script.type === 'visionary' ? 'Visionärt' : 'Analytiskt'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{script.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{getWordCount(script.content)} ord</span>
                <span>~{Math.ceil(getWordCount(script.content) / 150)} min</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {getPreviewText(script.content, 200)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={selectedScript === script.id ? "default" : "outline"}
                  onClick={() => handleSelectScript(script)}
                  className="flex-1"
                  size="sm"
                >
                  {selectedScript === script.id ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Valt
                    </>
                  ) : (
                    'Välj'
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(script.content, script.id)}
                >
                  {copiedScript === script.id ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleExpanded(script.id)}
                >
                  {expandedScript === script.id ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {expandedScript === script.id && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Fulltext:</h4>
                  <Textarea
                    value={script.content}
                    readOnly
                    className="min-h-[150px] text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Step Button */}
      {selectedScript && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  const selected = scripts.find(s => s.id === selectedScript);
                  if (selected) {
                    toast({
                      title: "Manus valt!",
                      description: `${selected.title} har valts för podcast-generering.`,
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                Fortsätt med valt manus
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScriptComparisonStep;
