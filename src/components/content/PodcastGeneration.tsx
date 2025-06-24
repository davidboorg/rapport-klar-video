
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
  Pause
} from 'lucide-react';
import { VOICE_PRESETS } from '@/integrations/elevenlabs/client';
import { usePodcastGeneration } from '@/hooks/usePodcastGeneration';

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
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS.professional_male);
  const [speechSpeed, setSpeechSpeed] = useState([1.0]);
  const [podcastLength, setPodcastLength] = useState('medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { isGenerating, generatedAudioUrl, generatePodcast, downloadPodcast } = usePodcastGeneration();

  const voiceOptions = [
    { id: VOICE_PRESETS.professional_male, name: 'Professional Male (Aria)', description: 'Clear, authoritative voice for business content' },
    { id: VOICE_PRESETS.professional_female, name: 'Professional Female (Sarah)', description: 'Engaging, confident voice for presentations' },
    { id: VOICE_PRESETS.executive_male, name: 'Executive Male (George)', description: 'Deep, commanding voice for board briefings' },
    { id: VOICE_PRESETS.analyst_female, name: 'Financial Analyst (Jessica)', description: 'Precise, analytical voice for detailed reports' }
  ];

  const lengthOptions = marketType === 'ir' 
    ? [
        { id: 'short', name: '5-8 minutes', description: 'Quick investor update' },
        { id: 'medium', name: '10-15 minutes', description: 'Standard earnings briefing' },
        { id: 'long', name: '20-25 minutes', description: 'Comprehensive annual review' }
      ]
    : [
        { id: 'short', name: '3-5 minutes', description: 'Executive summary only' },
        { id: 'medium', name: '8-12 minutes', description: 'Standard board briefing' },
        { id: 'long', name: '15-20 minutes', description: 'Detailed strategic review' }
      ];

  const handleGeneratePodcast = async () => {
    const audioUrl = await generatePodcast(scriptText, {
      voiceId: selectedVoice,
      speed: speechSpeed[0],
      targetLength: podcastLength as 'short' | 'medium' | 'long'
    });

    if (audioUrl) {
      onPodcastGenerated?.(audioUrl);
    }
  };

  const handlePlayPause = () => {
    if (!generatedAudioUrl) return;

    if (!audioElement) {
      const audio = new Audio(generatedAudioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    if (generatedAudioUrl) {
      const fileName = `${marketType === 'ir' ? 'investor-briefing' : 'board-briefing'}-podcast.mp3`;
      downloadPodcast(generatedAudioUrl, fileName);
    }
  };

  if (generatedAudioUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Generated Podcast Ready
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Audio Player */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">
                  {marketType === 'ir' ? 'Investor Briefing Podcast' : 'Board Meeting Briefing'}
                </h4>
                <p className="text-sm text-slate-600">
                  Generated with ElevenLabs • Voice: {voiceOptions.find(v => v.id === selectedVoice)?.name}
                </p>
              </div>
              <Button size="sm" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
          </div>

          {/* Podcast Info */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Podcast Ready!</h4>
                <p className="text-sm text-green-700">
                  High-quality audio generated with professional AI narration
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">Ready</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download MP3
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Podcast
            </Button>
            <Button variant="outline" onClick={handleGeneratePodcast} className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>

          {/* Distribution Options */}
          {marketType === 'ir' && (
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">Distribution Options</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Spotify for Podcasters</Button>
                <Button variant="outline" size="sm">Apple Podcasts</Button>
                <Button variant="outline" size="sm">Investor Portal</Button>
                <Button variant="outline" size="sm">Email Campaign</Button>
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
            Voice Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a voice for the podcast" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((voice) => (
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

      {/* Podcast Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Podcast Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Length Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Length</label>
            <Select value={podcastLength} onValueChange={setPodcastLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-slate-600">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speech Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Speech Speed</label>
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
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
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
                <p className="text-sm font-medium">Ready to generate podcast</p>
                <p className="text-xs text-slate-600">
                  Using ElevenLabs AI • Target: {lengthOptions.find(l => l.id === podcastLength)?.name}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleGeneratePodcast}
              disabled={isGenerating || !scriptText.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Mic className="w-5 h-5 mr-2 animate-pulse" />
                  Generating Podcast...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Generate {marketType === 'ir' ? 'Investor' : 'Board'} Podcast
                </>
              )}
            </Button>

            {!scriptText.trim() && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <Clock className="w-4 h-4" />
                You need a script to generate a podcast
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastGeneration;
