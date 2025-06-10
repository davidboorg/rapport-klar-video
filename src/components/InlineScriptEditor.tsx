
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit3, 
  Clock, 
  Volume2, 
  Sliders, 
  Lightbulb,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ScriptAlternative {
  type: 'executive' | 'investor' | 'social';
  title: string;
  duration: string;
  script: string;
  tone: string;
  key_points: string[];
}

interface InlineScriptEditorProps {
  selectedScript: ScriptAlternative;
  onScriptUpdate: (updatedScript: string) => void;
}

const InlineScriptEditor: React.FC<InlineScriptEditorProps> = ({ 
  selectedScript, 
  onScriptUpdate 
}) => {
  const [editedScript, setEditedScript] = useState(selectedScript.script);
  const [formalityLevel, setFormalityLevel] = useState([50]);
  const [confidenceLevel, setConfidenceLevel] = useState([70]);
  const [detailLevel, setDetailLevel] = useState([60]);
  const [isEditing, setIsEditing] = useState(false);

  // Calculate estimated speaking time (150 words per minute)
  const wordCount = editedScript.split(' ').filter(word => word.length > 0).length;
  const estimatedMinutes = Math.ceil(wordCount / 150);

  const handleScriptChange = (value: string) => {
    setEditedScript(value);
    onScriptUpdate(value);
  };

  const getToneDescription = () => {
    const formality = formalityLevel[0];
    const confidence = confidenceLevel[0];
    
    if (formality > 70 && confidence > 70) return 'Formell & Självsäker';
    if (formality > 70) return 'Formell & Balanserad';
    if (confidence > 70) return 'Avslappnad & Självsäker';
    if (formality < 30) return 'Vardaglig & Personlig';
    return 'Professionell & Balanserad';
  };

  const suggestions = [
    { type: 'highlight', text: 'Betona tillväxtsiffrorna i första stycket', icon: <Lightbulb className="w-4 h-4 text-yellow-600" /> },
    { type: 'context', text: 'Lägg till branschkontext för EBITDA-förbättringen', icon: <AlertCircle className="w-4 h-4 text-blue-600" /> },
    { type: 'explanation', text: 'Förklara vad som driver den starka kassaflödesutvecklingen', icon: <CheckCircle className="w-4 h-4 text-green-600" /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Anpassa Ditt Script</h3>
        <p className="text-sm text-gray-600 mb-4">
          Redigera innehållet och justera tonen för att matcha din presentationsstil
        </p>
      </div>

      {/* Script Metadata */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              {selectedScript.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{estimatedMinutes} min
              </Badge>
              <Badge variant="outline">{wordCount} ord</Badge>
              <Badge variant="outline">{getToneDescription()}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tone Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="w-5 h-5" />
            Ton och Stil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Formalitet</label>
                <span className="text-xs text-gray-500">
                  {formalityLevel[0] < 30 ? 'Vardaglig' : formalityLevel[0] > 70 ? 'Formell' : 'Professionell'}
                </span>
              </div>
              <Slider
                value={formalityLevel}
                onValueChange={setFormalityLevel}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Vardaglig</span>
                <span>Formell</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Självförtroende</label>
                <span className="text-xs text-gray-500">
                  {confidenceLevel[0] < 30 ? 'Försiktig' : confidenceLevel[0] > 70 ? 'Självsäker' : 'Balanserad'}
                </span>
              </div>
              <Slider
                value={confidenceLevel}
                onValueChange={setConfidenceLevel}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Konservativ</span>
                <span>Optimistisk</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Teknisk Detaljnivå</label>
                <span className="text-xs text-gray-500">
                  {detailLevel[0] < 30 ? 'Enkel' : detailLevel[0] > 70 ? 'Detaljerad' : 'Måttlig'}
                </span>
              </div>
              <Slider
                value={detailLevel}
                onValueChange={setDetailLevel}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Enkel</span>
                <span>Detaljerad</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5" />
            Smarta Förslag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {suggestion.icon}
                <div className="flex-1">
                  <p className="text-sm">{suggestion.text}</p>
                </div>
                <Button variant="outline" size="sm">
                  Tillämpa
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Script Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit3 className="w-5 h-5" />
              Script Editor
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Förhandsgranska' : 'Redigera'}
              </Button>
              <Button variant="outline" size="sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Testa Uppläsning
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedScript}
              onChange={(e) => handleScriptChange(e.target.value)}
              className="min-h-[400px] resize-y font-mono text-sm"
              placeholder="Redigera ditt videomanus här..."
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed">
              {editedScript}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kvalitetskontroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Finansiella data verifierade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Professionellt språk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Konsistent tonalitet</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Finansiell terminologi</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Compliance check rekommenderad</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InlineScriptEditor;
