
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Share2, Play, Check } from 'lucide-react';

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

interface ScriptAlternativesDisplayProps {
  alternatives: ScriptAlternative[];
  onScriptSelect: (script: ScriptAlternative) => void;
}

const ScriptAlternativesDisplay: React.FC<ScriptAlternativesDisplayProps> = ({ 
  alternatives, 
  onScriptSelect 
}) => {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'executive':
        return <Users className="w-4 h-4" />;
      case 'investor':
        return <TrendingUp className="w-4 h-4" />;
      case 'social':
        return <Share2 className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getToneColor = (tone: string) => {
    if (tone.toLowerCase().includes('professional')) return 'bg-blue-100 text-blue-800';
    if (tone.toLowerCase().includes('detailed')) return 'bg-purple-100 text-purple-800';
    if (tone.toLowerCase().includes('engaging')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSelectScript = (script: ScriptAlternative) => {
    setSelectedScript(script.type);
    onScriptSelect(script);
  };

  const previewScript = (script: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(script.substring(0, 200));
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (!alternatives || alternatives.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">No script alternatives available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generated Script Alternatives</CardTitle>
          <p className="text-sm text-gray-600">
            Choose the script that best fits your audience and communication goals.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue={alternatives[0]?.type} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {alternatives.map((script) => (
            <TabsTrigger key={script.type} value={script.type} className="flex items-center gap-2">
              {getIcon(script.type)}
              {script.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {alternatives.map((script) => (
          <TabsContent key={script.type} value={script.type}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getIcon(script.type)}
                    {script.title}
                  </CardTitle>
                  {selectedScript === script.type && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {script.duration}
                  </div>
                  <Badge className={getToneColor(script.tone)}>
                    {script.tone}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Points */}
                {script.key_points && script.key_points.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {script.key_points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Script Text */}
                <div>
                  <h4 className="font-medium mb-2">Script:</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {script.script}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSelectScript(script)}
                    disabled={selectedScript === script.type}
                  >
                    {selectedScript === script.type ? 'Selected' : 'Select This Script'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => previewScript(script.script)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScriptAlternativesDisplay;
