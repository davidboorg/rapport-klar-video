
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Share2, CheckCircle } from 'lucide-react';

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
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getScriptDescription = (type: string) => {
    switch (type) {
      case 'executive':
        return 'Kort översikt för upptagna chefer';
      case 'investor':
        return 'Detaljerad analys med finansiell kontext';
      case 'social':
        return 'Slagkraftiga highlights för social delning';
      default:
        return 'Professionell presentation';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'executive':
        return 'border-blue-200';
      case 'investor':
        return 'border-green-200';
      case 'social':
        return 'border-purple-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Välj Script-stil</h3>
        <p className="text-sm text-gray-600 mb-4">
          Jämför de tre alternativen och välj den stil som bäst passar din målgrupp
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {scriptAlternatives.map((script, index) => {
          const isSelected = selectedScript?.type === script.type;
          
          return (
            <Card 
              key={index} 
              className={`${getBorderColor(script.type)} ${isSelected ? 'ring-2 ring-blue-500' : ''} transition-all cursor-pointer hover:shadow-md`}
              onClick={() => onScriptSelect(script)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScriptIcon(script.type)}
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                </div>
                <p className="text-sm text-gray-600">{getScriptDescription(script.type)}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Duration and Tone */}
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {script.duration}
                  </Badge>
                  <Badge variant="outline">{script.tone}</Badge>
                </div>

                {/* Key Points */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Huvudpunkter:</h5>
                  <ul className="space-y-1">
                    {script.key_points.slice(0, 3).map((point, pointIndex) => (
                      <li key={pointIndex} className="text-xs text-gray-600 flex items-start gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Script Preview */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Förhandsvisning:</h5>
                  <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                    {script.script.substring(0, 200)}...
                  </div>
                </div>

                {/* Select Button */}
                <Button 
                  variant={isSelected ? "default" : "outline"} 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScriptSelect(script);
                  }}
                >
                  {isSelected ? 'Valt' : 'Välj detta script'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {scriptAlternatives.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Inga script-alternativ tillgängliga än.</p>
              <p className="text-sm">Starta bearbetning för att generera script-alternativ.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScriptComparisonView;
