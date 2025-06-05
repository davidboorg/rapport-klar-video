import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VideoGeneration from "./VideoGeneration";
import { 
  Save, 
  Play, 
  Clock, 
  FileText, 
  Wand2,
  RefreshCw,
  Film
} from "lucide-react";

interface ScriptEditorProps {
  projectId: string;
  initialScript?: string;
  onScriptUpdate?: (script: string) => void;
}

interface FinancialData {
  company_name?: string;
  period?: string;
  revenue?: string;
  ebitda?: string;
  growth_percentage?: string;
  key_highlights?: string[];
}

const ScriptEditor = ({ projectId, initialScript = "", onScriptUpdate }: ScriptEditorProps) => {
  const [script, setScript] = useState(initialScript);
  const [isSaving, setSaving] = useState(false);
  const [isRegenerating, setRegenerating] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate estimated video duration (150 words per minute speaking rate)
  const estimatedDuration = Math.ceil(script.split(' ').filter(word => word.length > 0).length / 150);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project financial data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('financial_data')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      if (projectData?.financial_data) {
        setFinancialData(projectData.financial_data as FinancialData);
      }

      // Fetch existing video if any
      const { data: videoData, error: videoError } = await supabase
        .from('generated_content')
        .select('video_url')
        .eq('project_id', projectId)
        .single();

      if (!videoError && videoData?.video_url) {
        setExistingVideoUrl(videoData.video_url);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .upsert({
          project_id: projectId,
          script_text: script,
          generation_status: 'completed',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Manus sparat",
        description: "Ditt videomanus har sparats framgångsrikt.",
      });

      onScriptUpdate?.(script);
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara manuset. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!financialData) {
      toast({
        title: "Fel",
        description: "Ingen finansiell data finns för att regenerera manuset.",
        variant: "destructive",
      });
      return;
    }

    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId,
          regenerateScript: true,
          financialData 
        }
      });

      if (error) throw error;
      if (data?.script) {
        setScript(data.script);
        toast({
          title: "Manus regenererat",
          description: "Ett nytt videomanus har genererats.",
        });
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      toast({
        title: "Fel",
        description: "Kunde inte regenerera manuset. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handlePreview = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = 'sv-SE';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Förhandsvisning ej tillgänglig",
        description: "Din webbläsare stöder inte tal-förhandsvisning.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="script" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Videomanus
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Generera Video
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="script">
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
              {/* Financial Data Summary */}
              {financialData && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2">Finansiell data:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Företag:</span>
                      <p className="text-slate-600">{financialData.company_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Period:</span>
                      <p className="text-slate-600">{financialData.period || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Intäkter:</span>
                      <p className="text-slate-600">{financialData.revenue || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tillväxt:</span>
                      <p className="text-slate-600">{financialData.growth_percentage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

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
                <Button onClick={handleSave} disabled={isSaving || !script.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sparar...' : 'Spara manus'}
                </Button>
                
                <Button variant="outline" onClick={handlePreview} disabled={!script.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  Förhandsgranska
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleRegenerate} 
                  disabled={isRegenerating || !financialData}
                >
                  {isRegenerating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {isRegenerating ? 'Regenererar...' : 'Regenerera manus'}
                </Button>
              </div>

              {/* Tips */}
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <h5 className="font-medium mb-1">Tips för ett bra videomanus:</h5>
                <ul className="text-slate-600 space-y-1">
                  <li>• Håll en tydlig struktur: Intro → Höjdpunkter → Framtidsutsikter</li>
                  <li>• Använd enkla, tydliga meningar</li>
                  <li>• Inkludera konkreta siffror och procentsatser</li>
                  <li>• Räkna med ~150 ord per minut talat språk</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <VideoGeneration
            projectId={projectId}
            scriptText={script}
            financialData={financialData}
            existingVideoUrl={existingVideoUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptEditor;
