
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Share2, CheckCircle, Eye, TrendingUp, Play } from 'lucide-react';

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

interface ScriptComparisonViewProps {
  scriptAlternatives: ScriptAlternative[];
  onScriptSelect: (script: ScriptAlternative) => void;
  selectedScript?: ScriptAlternative;
}

const ScriptComparisonView: React.FC<ScriptComparisonViewProps> = ({ 
  scriptAlternatives, 
  onScriptSelect,
  selectedScript 
}) => {
  const getScriptIcon = (type: string) => {
    switch (type) {
      case 'executive':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'investor':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getScriptDescription = (type: string) => {
    switch (type) {
      case 'executive':
        return 'Koncis översikt för upptagna beslutsfattare';
      case 'investor':
        return 'Detaljerad finansiell analys med djupgående insikter';
      case 'social':
        return 'Engagerande innehåll optimerat för social delning';
      default:
        return 'Professionell presentation';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'executive':
        return 'border-blue-200 hover:border-blue-300';
      case 'investor':
        return 'border-green-200 hover:border-green-300';
      case 'social':
        return 'border-purple-200 hover:border-purple-300';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getBackgroundGradient = (type: string) => {
    switch (type) {
      case 'executive':
        return 'from-blue-50 to-blue-100';
      case 'investor':
        return 'from-green-50 to-green-100';
      case 'social':
        return 'from-purple-50 to-purple-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  const previewScript = (script: ScriptAlternative) => {
    if ('speechSynthesis' in window) {
      // Stoppa eventuell pågående uppläsning
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(script.script.substring(0, 200));
      utterance.lang = 'sv-SE';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getWordCount = (script: string) => {
    return script.split(/\s+/).length;
  };

  if (scriptAlternatives.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-gray-500">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Inga script-alternativ tillgängliga</h3>
            <p className="text-sm">AI:n arbetar fortfarande med att skapa script-alternativ baserat på din finansiella data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Välj Ditt Perfekta Script</h3>
        <p className="text-sm text-gray-600 mb-4">
          AI:n har genererat {scriptAlternatives.length} anpassade script-alternativ baserat på din finansiella data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {scriptAlternatives.map((script, index) => {
          const isSelected = selectedScript?.type === script.type;
          const wordCount = getWordCount(script.script);
          
          return (
            <Card 
              key={index} 
              className={`${getBorderColor(script.type)} ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'} 
                         transition-all duration-200 cursor-pointer hover:shadow-lg bg-gradient-to-br ${getBackgroundGradient(script.type)}`}
              onClick={() => onScriptSelect(script)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScriptIcon(script.type)}
                    <CardTitle className="text-lg font-semibold">{script.title}</CardTitle>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{getScriptDescription(script.type)}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Duration, Tone and Stats */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {script.duration}
                  </Badge>
                  <Badge variant="outline">{script.tone}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {wordCount} ord
                  </Badge>
                </div>

                {/* Key Points */}
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Huvudpunkter:
                  </h5>
                  <ul className="space-y-1">
                    {script.key_points?.slice(0, 3).map((point, pointIndex) => (
                      <li key={pointIndex} className="text-xs text-gray-600 flex items-start gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Script Preview */}
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Förhandsvisning:
                  </h5>
                  <div className="bg-white/70 p-3 rounded text-xs text-gray-700 max-h-24 overflow-y-auto border">
                    {script.script.substring(0, 180)}
                    {script.script.length > 180 && '...'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onScriptSelect(script);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valt
                      </>
                    ) : (
                      'Välj Script'
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewScript(script);
                    }}
                    title="Lyssna på förhandsvisning"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {scriptAlternatives.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Klicka på ett script för att välja det, eller använd <Play className="w-3 h-3 inline" /> för att höra en förhandsvisning
          </p>
        </div>
      )}
    </div>
  );
};

export default ScriptComparisonView;
