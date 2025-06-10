
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  Users, 
  Share2,
  Edit3,
  Check,
  AlertCircle,
  Play
} from "lucide-react";

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

interface FinancialData {
  company_name?: string;
  period?: string;
  revenue?: string;
  ebitda?: string;
  growth_percentage?: string;
  key_highlights?: string[];
  concerns?: string[];
}

interface ScriptReviewInterfaceProps {
  projectId: string;
  financialData: FinancialData;
  scriptAlternatives: ScriptAlternative[];
  onScriptSelect: (script: ScriptAlternative) => void;
  onCustomizeScript: (customizedScript: string) => void;
}

const ScriptReviewInterface = ({ 
  projectId, 
  financialData, 
  scriptAlternatives, 
  onScriptSelect,
  onCustomizeScript 
}: ScriptReviewInterfaceProps) => {
  const [selectedScript, setSelectedScript] = useState<ScriptAlternative | null>(null);
  const [customScript, setCustomScript] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    if (scriptAlternatives.length > 0) {
      setSelectedScript(scriptAlternatives[0]);
      setCustomScript(scriptAlternatives[0].script);
    }
  }, [scriptAlternatives]);

  const handleScriptSelection = (script: ScriptAlternative) => {
    setSelectedScript(script);
    setCustomScript(script.script);
    onScriptSelect(script);
  };

  const handleCustomization = () => {
    onCustomizeScript(customScript);
    setIsCustomizing(false);
  };

  const getScriptIcon = (type: string) => {
    switch (type) {
      case 'executive': return <FileText className="w-4 h-4" />;
      case 'investor': return <TrendingUp className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getScriptColor = (type: string) => {
    switch (type) {
      case 'executive': return 'bg-blue-100 text-blue-800';
      case 'investor': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const estimateWords = (text: string) => {
    return text.split(' ').filter(word => word.length > 0).length;
  };

  return (
    <div className="space-y-6">
      {/* Financial Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Extraherad Finansiell Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">{financialData.company_name}</h4>
              <p className="text-sm text-blue-700">{financialData.period}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Intäkter</h4>
              <p className="text-sm text-green-700">{financialData.revenue || 'N/A'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Tillväxt</h4>
              <p className="text-sm text-purple-700">{financialData.growth_percentage || 'N/A'}</p>
            </div>
          </div>
          
          {financialData.key_highlights && financialData.key_highlights.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2">Viktiga Höjdpunkter:</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                {financialData.key_highlights.map((highlight, index) => (
                  <li key={index}>• {highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {financialData.concerns && financialData.concerns.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Områden att Adressera:
              </h5>
              <ul className="text-sm text-orange-800 space-y-1">
                {financialData.concerns.map((concern, index) => (
                  <li key={index}>• {concern}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Alternatives Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Välj Ditt Script-Alternativ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {scriptAlternatives.map((script, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedScript?.type === script.type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleScriptSelection(script)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getScriptIcon(script.type)}
                    <h3 className="font-medium">{script.title}</h3>
                  </div>
                  <Badge className={getScriptColor(script.type)}>
                    {script.duration}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Ton: {script.tone} • {estimateWords(script.script)} ord
                </p>
                
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-gray-700">Fokusområden:</h5>
                  {script.key_points.slice(0, 2).map((point, idx) => (
                    <p key={idx} className="text-xs text-gray-600">• {point}</p>
                  ))}
                </div>

                {selectedScript?.type === script.type && (
                  <div className="mt-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">Valt</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Script Preview and Customization */}
          {selectedScript && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Förhandsgranska</TabsTrigger>
                <TabsTrigger value="customize">Anpassa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{selectedScript.title}</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{selectedScript.duration}</span>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{selectedScript.script}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(selectedScript.script);
                        utterance.lang = 'sv-SE';
                        speechSynthesis.speak(utterance);
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Förhandsgranska
                  </Button>
                  <Button 
                    onClick={() => onScriptSelect(selectedScript)}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Använd Detta Script
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="customize" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Anpassa Ton:</label>
                    <Select value={selectedTone} onValueChange={setSelectedTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professionell</SelectItem>
                        <SelectItem value="conversational">Konversational</SelectItem>
                        <SelectItem value="confident">Självsäker</SelectItem>
                        <SelectItem value="enthusiastic">Entusiastisk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Redigera Script:</label>
                    <Textarea
                      value={customScript}
                      onChange={(e) => setCustomScript(e.target.value)}
                      className="min-h-[300px]"
                      placeholder="Redigera ditt script här..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{estimateWords(customScript)} ord</span>
                    <span>~{Math.ceil(estimateWords(customScript) / 150)} minuter</span>
                  </div>
                  
                  <Button 
                    onClick={handleCustomization}
                    className="w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Spara Anpassningar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptReviewInterface;
