
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Mic, 
  Play, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle,
  Settings,
  User,
  Volume2,
  Pause,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Professional voice presets for business content
const VOICE_PRESETS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Professional Female)', description: 'Clear, authoritative voice for business presentations' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Executive Female)', description: 'Confident, engaging voice for investor relations' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Executive Male)', description: 'Deep, commanding voice for board briefings' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (Analyst)', description: 'Precise, analytical voice for financial reports' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Narrator)', description: 'Professional narrator voice for detailed content' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Young Professional)', description: 'Modern, approachable voice for contemporary content' }
];

interface PodcastGenerationProps {
  projectId: string;
  scriptText: string;
  marketType: 'ir' | 'board';
  onPodcastGenerated?: (podcastUrl: string) => void;
}

const PodcastGeneration = ({ 
  projectId, 
  scriptText, 
  marketType, 
  onPodcastGenerated 
}: PodcastGenerationProps) => {
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS[0].id);
  const [speechSpeed, setSpeechSpeed] = useState([1.0]);
  const [stability, setStability] = useState([0.5]);
  const [clarity, setClarity] = useState([0.75]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();

  const handleGeneratePodcast = async () => {
    if (!scriptText.trim()) {
      toast({
        title: "Inget manus",
        description: "Du behöver ett manus för att generera podcast",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      console.log('Genererar podcast med ElevenLabs...');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-podcast', {
        body: {
          text: scriptText,
          voice: selectedVoice,
          projectId: projectId,
          voiceSettings: {
            stability: stability[0],
            similarity_boost: clarity[0],
            style: 0.0,
            use_speaker_boost: true
          }
        }
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (audioError) {
        throw new Error(`Podcast-generering misslyckades: ${audioError.message}`);
      }

      if (!audioData?.success) {
        throw new Error(`Podcast-fel: ${audioData?.error || 'Okänt fel'}`);
      }

      console.log('Audio data received, converting to playable format...');

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(audioData.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setGeneratedAudioUrl(audioUrl);
      onPodcastGenerated?.(audioUrl);

      toast({
        title: "Podcast genererad!",
        description: "Din podcast är redo att lyssna på och ladda ner",
      });

    } catch (error) {
      console.error('Podcast generation failed:', error);
      toast({
        title: "Generering misslyckades",
        description: `Kunde inte generera podcast: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (!generatedAudioUrl) return;

    if (!audioElement) {
      const audio = new Audio(generatedAudioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlaying(false);
      };
      setAudioElement(audio);
      audio.play().then(() => setIsPlaying(true));
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().then(() => setIsPlaying(true));
      }
    }
  };

  const handleDownload = () => {
    if (generatedAudioUrl) {
      const fileName = `${marketType === 'ir' ? 'investor-briefing' : 'board-briefing'}-podcast-${Date.now()}.mp3`;
      const link = document.createElement('a');
      link.href = generatedAudioUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Nedladdning startad",
        description: `${fileName} laddas ner`,
      });
    }
  };

  const handleRegenerateWithSettings = () => {
    setGeneratedAudioUrl(null);
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
  };

  const selectedVoiceInfo = VOICE_PRESETS.find(v => v.id === selectedVoice);

  if (generatedAudioUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Podcast klar!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Audio Player */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">
                  {marketType === 'ir' ? 'Investor Briefing Podcast' : 'Styrelsegenomgång'}
                </h4>
                <p className="text-sm text-slate-600">
                  Röst: {selectedVoiceInfo?.name} • ElevenLabs AI
                </p>
              </div>
              <Button onClick={handlePlayPause} className="shrink-0">
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pausa' : 'Spela'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Ladda ner MP3
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Dela podcast
            </Button>
            <Button variant="outline" onClick={handleRegenerateWithSettings} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Skapa ny version
            </Button>
          </div>

          {/* Distribution Options for IR */}
          {marketType === 'ir' && (
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2 text-sm">Distributionsalternativ</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Investor Portal</Button>
                <Button variant="outline" size="sm">E-postkampanj</Button>
                <Button variant="outline" size="sm">Spotify</Button>
                <Button variant="outline" size="sm">Apple Podcasts</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Röstval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Välj röst för podcasten" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_PRESETS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-sm text-slate-600">{voice.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Advanced Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Avancerade röstinställningar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Stabilitet</label>
              <span className="text-sm text-slate-600">{stability[0]}</span>
            </div>
            <Slider
              value={stability}
              onValueChange={setStability}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Varierad</span>
              <span>Stabil</span>
            </div>
          </div>

          {/* Clarity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Klarhet</label>
              <span className="text-sm text-slate-600">{clarity[0]}</span>
            </div>
            <Slider
              value={clarity}
              onValueChange={setClarity}
              max={1}
              min={0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Mjuk</span>
              <span>Skarp</span>
            </div>
          </div>

          {/* Speech Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Talhastighet</label>
              <span className="text-sm text-slate-600">{speechSpeed[0]}x</span>
            </div>
            <Slider
              value={speechSpeed}
              onValueChange={setSpeechSpeed}
              max={1.5}
              min={0.7}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Långsam</span>
              <span>Normal</span>
              <span>Snabb</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Redo att generera podcast</p>
                <p className="text-xs text-slate-600">
                  Röst: {selectedVoiceInfo?.name} • ElevenLabs AI
                </p>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Genererar podcast...</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleGeneratePodcast}
              disabled={isGenerating || !scriptText.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Mic className="w-5 h-5 mr-2 animate-pulse" />
                  Genererar podcast...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Generera {marketType === 'ir' ? 'Investor' : 'Styrelsemötes'} Podcast
                </>
              )}
            </Button>

            {!scriptText.trim() && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <Clock className="w-4 h-4" />
                Du behöver ett manus för att generera podcast
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastGeneration;
