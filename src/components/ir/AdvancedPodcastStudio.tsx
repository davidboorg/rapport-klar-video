
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  RefreshCw,
  Wand2,
  Globe,
  Sparkles,
  Brain,
  Headphones,
  Mic2,
  Users,
  TrendingUp,
  Building,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Enhanced professional voice presets with emotional range
const EXECUTIVE_VOICES = [
  { 
    id: '9BWtsMINqrJLrRacOk9x', 
    name: 'Aria', 
    type: 'Professional Female',
    description: 'Clear, authoritative voice perfect for quarterly earnings calls',
    personality: 'Confident & Trustworthy',
    bestFor: 'Earnings presentations, board meetings',
    accent: 'American',
    age: 'Mid-career executive'
  },
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Sarah', 
    type: 'Executive Female',
    description: 'Warm yet commanding presence for investor relations',
    personality: 'Engaging & Strategic',
    bestFor: 'Investor briefings, annual reports',
    accent: 'International Business',
    age: 'Senior executive'
  },
  { 
    id: 'JBFqnCBsd6RMkjVDRZzb', 
    name: 'George', 
    type: 'Executive Male',
    description: 'Deep, commanding voice that conveys stability and growth',
    personality: 'Authoritative & Reassuring',
    bestFor: 'CEO messages, crisis communications',
    accent: 'American Corporate',
    age: 'Seasoned leader'
  },
  { 
    id: 'cgSgspJ2msm6clMCkdW9', 
    name: 'Jessica', 
    type: 'Financial Analyst',
    description: 'Precise, analytical voice for detailed financial breakdowns',
    personality: 'Analytical & Detail-oriented',
    bestFor: 'Financial deep-dives, technical analysis',
    accent: 'Professional Neutral',
    age: 'Expert analyst'
  }
];

// Professional tone presets for different IR scenarios
const TONE_PRESETS = {
  'confident-growth': {
    name: 'Confident Growth',
    description: 'Optimistic and forward-looking for positive results',
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.3,
    emotion: 'positive',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  'steady-professional': {
    name: 'Steady Professional',
    description: 'Balanced and trustworthy for regular updates',
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    emotion: 'neutral',
    icon: Building,
    color: 'text-blue-600'
  },
  'serious-analytical': {
    name: 'Serious Analytical',
    description: 'Focused and detailed for complex financial discussions',
    stability: 0.6,
    similarity_boost: 0.7,
    style: -0.2,
    emotion: 'serious',
    icon: Brain,
    color: 'text-purple-600'
  },
  'reassuring-crisis': {
    name: 'Reassuring Authority',
    description: 'Calm and confident for challenging periods',
    stability: 0.8,
    similarity_boost: 0.85,
    style: 0.1,
    emotion: 'calm',
    icon: Users,
    color: 'text-orange-600'
  }
};

// Multi-language support for global IR
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', model: 'eleven_multilingual_v2' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', model: 'eleven_multilingual_v2' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', model: 'eleven_multilingual_v2' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', model: 'eleven_multilingual_v2' },
  { code: 'es', name: 'Español', flag: '🇪🇸', model: 'eleven_multilingual_v2' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', model: 'eleven_multilingual_v2' },
  { code: 'zh', name: '中文', flag: '🇨🇳', model: 'eleven_multilingual_v2' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', model: 'eleven_multilingual_v2' }
];

interface AdvancedPodcastStudioProps {
  projectId: string;
  scriptText: string;
  financialData?: any;
  onPodcastGenerated?: (podcastUrl: string) => void;
}

const AdvancedPodcastStudio: React.FC<AdvancedPodcastStudioProps> = ({ 
  projectId, 
  scriptText, 
  financialData,
  onPodcastGenerated 
}) => {
  const [selectedVoice, setSelectedVoice] = useState(EXECUTIVE_VOICES[0].id);
  const [selectedTone, setSelectedTone] = useState('steady-professional');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [customSettings, setCustomSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
    optimize_streaming_latency: 0
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { toast } = useToast();

  // Apply tone preset to settings
  const applyTonePreset = (toneKey: string) => {
    const tone = TONE_PRESETS[toneKey];
    if (tone) {
      setCustomSettings(prev => ({
        ...prev,
        stability: tone.stability,
        similarity_boost: tone.similarity_boost,
        style: tone.style
      }));
    }
  };

  useEffect(() => {
    applyTonePreset(selectedTone);
  }, [selectedTone]);

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
      // Enhanced progress simulation with more steps
      const progressSteps = [
        { progress: 10, message: 'Analyserar manusinnehåll...' },
        { progress: 25, message: 'Optimerar röstinställningar...' },
        { progress: 40, message: 'Förbereder ElevenLabs AI...' },
        { progress: 60, message: 'Genererar professionell audio...' },
        { progress: 80, message: 'Tillämpar tonalitet och stil...' },
        { progress: 95, message: 'Slutför ljudbearbetning...' }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setGenerationProgress(progressSteps[currentStep].progress);
          toast({
            title: progressSteps[currentStep].message,
            description: `${progressSteps[currentStep].progress}% färdigt`
          });
          currentStep++;
        }
      }, 800);

      const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);
      
      const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-podcast', {
        body: {
          text: scriptText,
          voice: selectedVoice,
          projectId: projectId,
          model_id: selectedLang?.model || 'eleven_multilingual_v2',
          voiceSettings: customSettings
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

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(audioData.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setGeneratedAudioUrl(audioUrl);
      onPodcastGenerated?.(audioUrl);

      toast({
        title: "🎉 Professionell podcast genererad!",
        description: "Din IR-kommunikation är redo för global distribution",
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

  const selectedVoiceInfo = EXECUTIVE_VOICES.find(v => v.id === selectedVoice);
  const selectedToneInfo = TONE_PRESETS[selectedTone];
  const selectedLangInfo = LANGUAGES.find(l => l.code === selectedLanguage);

  if (generatedAudioUrl) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Premium IR Podcast Klar!
            </span>
            <Badge className="bg-green-100 text-green-700">
              <Star className="w-3 h-3 mr-1" />
              Professional Grade
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Enhanced Audio Player */}
          <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-800">
                  {financialData?.company_name || 'Corporate'} IR Briefing
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{selectedVoiceInfo?.name}</span>
                  <span>•</span>
                  <span>{selectedToneInfo?.name}</span>
                  <span>•</span>
                  <span>{selectedLangInfo?.flag} {selectedLangInfo?.name}</span>
                </div>
                <Badge variant="outline" className="mt-2">
                  ElevenLabs Premium AI • Professional Grade
                </Badge>
              </div>
              <Button onClick={handlePlayPause} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pausa' : 'Spela upp'}
              </Button>
            </div>
          </div>

          {/* Professional Distribution Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h5 className="font-semibold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportalternativ
              </h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  High-Quality MP3 (320kbps)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Broadcast WAV (48kHz)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Web-optimerad version
                </Button>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h5 className="font-semibold mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Distribution
              </h5>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Building className="w-4 h-4 mr-2" />
                  Investor Portal
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Media & Analysts
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Social Media Ready
                </Button>
              </div>
            </Card>
          </div>

          {/* Professional Insights */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h5 className="font-semibold mb-2 text-blue-800">Professional Insights</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Röstprofil:</span>
                <p className="text-gray-600">{selectedVoiceInfo?.personality}</p>
              </div>
              <div>
                <span className="font-medium">Tonalitet:</span>
                <p className="text-gray-600">{selectedToneInfo?.description}</p>
              </div>
              <div>
                <span className="font-medium">Språk:</span>
                <p className="text-gray-600">{selectedLangInfo?.name} (Global)</p>
              </div>
              <div>
                <span className="font-medium">Kvalitet:</span>
                <p className="text-gray-600">Broadcast Standard</p>
              </div>
            </div>
          </Card>

          <Button 
            variant="outline" 
            onClick={() => {
              setGeneratedAudioUrl(null);
              if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
                setIsPlaying(false);
              }
            }}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Skapa ny version med andra inställningar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional IR Podcast Studio
            </span>
            <Badge className="bg-blue-100 text-blue-700">
              ElevenLabs Premium
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Executive Voice
          </TabsTrigger>
          <TabsTrigger value="tone" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Professional Tone
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global Markets
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Executive Voice Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {EXECUTIVE_VOICES.map((voice) => (
                  <Card 
                    key={voice.id} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedVoice === voice.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{voice.name}</h4>
                          <Badge variant="outline">{voice.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="font-medium">Personality:</span> {voice.personality}</div>
                          <div><span className="font-medium">Best for:</span> {voice.bestFor}</div>
                          <div><span className="font-medium">Accent:</span> {voice.accent}</div>
                          <div><span className="font-medium">Experience:</span> {voice.age}</div>
                        </div>
                      </div>
                      {selectedVoice === voice.id && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tone">
          <Card>
            <CardHeader>
              <CardTitle>Professional Tone & Emotion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(TONE_PRESETS).map(([key, tone]) => {
                  const IconComponent = tone.icon;
                  return (
                    <Card 
                      key={key}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedTone === key ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTone(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className={`w-6 h-6 ${tone.color}`} />
                        <h4 className="font-bold">{tone.name}</h4>
                        {selectedTone === key && (
                          <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{tone.description}</p>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Global Market Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LANGUAGES.map((lang) => (
                  <Card 
                    key={lang.code}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md text-center ${
                      selectedLanguage === lang.code ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <div className="text-2xl mb-1">{lang.flag}</div>
                    <div className="font-medium text-sm">{lang.name}</div>
                    {selectedLanguage === lang.code && (
                      <CheckCircle className="w-4 h-4 text-blue-600 mx-auto mt-1" />
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Audio Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stability Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Voice Stability</label>
                  <span className="text-sm text-slate-600">{customSettings.stability}</span>
                </div>
                <Slider
                  value={[customSettings.stability]}
                  onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, stability: value }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Dynamic</span>
                  <span>Consistent</span>
                </div>
              </div>

              {/* Clarity Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Voice Clarity</label>
                  <span className="text-sm text-slate-600">{customSettings.similarity_boost}</span>
                </div>
                <Slider
                  value={[customSettings.similarity_boost]}
                  onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, similarity_boost: value }))}
                  max={1}
                  min={0}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Soft</span>
                  <span>Crisp</span>
                </div>
              </div>

              {/* Style Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Speaking Style</label>
                  <span className="text-sm text-slate-600">{customSettings.style}</span>
                </div>
                <Slider
                  value={[customSettings.style]}
                  onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, style: value }))}
                  max={1}
                  min={-1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Conversational</span>
                  <span>Neutral</span>
                  <span>Expressive</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Mic2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Ready to Create Professional IR Audio</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{selectedVoiceInfo?.name}</span>
                  <span>•</span>
                  <span>{selectedToneInfo?.name}</span>
                  <span>•</span>
                  <span>{selectedLangInfo?.flag} {selectedLangInfo?.name}</span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                Enterprise Grade
              </Badge>
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Generating professional IR podcast...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-3" />
              </div>
            )}

            <Button 
              onClick={handleGeneratePodcast}
              disabled={isGenerating || !scriptText.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Creating Professional IR Audio...
                </>
              ) : (
                <>
                  <Mic2 className="w-5 h-5 mr-2" />
                  Generate Premium IR Podcast
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPodcastStudio;
