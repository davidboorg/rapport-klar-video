
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Play, 
  Clock, 
  FileText, 
  Wand2,
  RefreshCw
} from "lucide-react";

interface ScriptManualEditorProps {
  script: string;
  setScript: (script: string) => void;
  isSaving: boolean;
  isProcessing: boolean;
  onSave: () => void;
  onPreview: () => void;
  onRegenerateScript: () => void;
}

const ScriptManualEditor = ({
  script,
  setScript,
  isSaving,
  isProcessing,
  onSave,
  onPreview,
  onRegenerateScript
}: ScriptManualEditorProps) => {
  // Calculate estimated video duration (150 words per minute speaking rate)
  const estimatedDuration = Math.ceil(script.split(' ').filter(word => word.length > 0).length / 150);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Videomanus Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{estimatedDuration} min
            </Badge>
            <Badge variant="outline">
              {script.split(' ').filter(word => word.length > 0).length} ord
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Script Editor */}
        <div className="space-y-2">
          <label htmlFor="script" className="text-sm font-medium">
            Videomanus
          </label>
          <Textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Skriv eller redigera ditt videomanus här..."
            className="min-h-[300px] resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSave} disabled={isSaving || !script.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sparar...' : 'Spara manus'}
          </Button>
          
          <Button variant="outline" onClick={onPreview} disabled={!script.trim()}>
            <Play className="w-4 h-4 mr-2" />
            Förhandsgranska
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRegenerateScript} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Regenerera Script
          </Button>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          <h5 className="font-medium mb-1">AI-optimerat manus:</h5>
          <ul className="text-slate-600 space-y-1">
            <li>• Baserat på extraherad finansiell data från din rapport</li>
            <li>• Optimerat för professionell video-presentation</li>
            <li>• Inkluderar konkreta siffror och viktiga insights</li>
            <li>• Anpassat för svensk affärskommunikation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptManualEditor;
