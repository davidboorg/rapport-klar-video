
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Headphones, Play } from 'lucide-react';

interface AudioGenerationStepProps {
  script: string;
  audioUrl: string | null;
  onAudioReady: () => void;
}

const AudioGenerationStep: React.FC<AudioGenerationStepProps> = ({ 
  script, 
  audioUrl, 
  onAudioReady 
}) => {
  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="w-5 h-5" />
          Generera podcast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!audioUrl ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 mb-2">
              Genererar podcast från manuset...
            </p>
            <p className="text-sm text-gray-500">
              Detta kan ta en minut
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Podcasten är klar! Du kan lyssna på den nedan.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handlePlayAudio}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Spela upp
                </Button>
                <span className="text-sm text-gray-600">
                  Podcast genererad från manus
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={onAudioReady}>
                Fortsätt till video
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioGenerationStep;
