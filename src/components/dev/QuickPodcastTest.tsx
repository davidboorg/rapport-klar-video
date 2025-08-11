import React, { useMemo } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { usePodcastGeneration } from '@/hooks/usePodcastGeneration';
import { Headphones, Download, PlayCircle } from 'lucide-react';

const SAMPLE_TEXT = `Hej! Det här är ett snabbtest av podcastgenereringen.\n\nVi kontrollerar att Edge-funktionen skapar ljudfilen, laddar upp till privat lagring och returnerar en signerad URL.`;

export default function QuickPodcastTest() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const show = useMemo(() => new URLSearchParams(search).get('test') === '1', [search]);
  const { isGenerating, generatedAudioUrl, generatePodcast, downloadPodcast } = usePodcastGeneration();

  if (!show) return null;

  const handleGenerate = async () => {
    await generatePodcast(SAMPLE_TEXT, {
      voiceId: '9BWtsMINqrJLrRacOk9x', // Aria (default)
      speed: 1,
      targetLength: 'short',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[90vw]">
      <ModernCard variant="glass" className="shadow-xl">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5" /> Snabbtest Podcast
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-3">
          {!generatedAudioUrl ? (
            <ModernButton onClick={handleGenerate} disabled={isGenerating} className="w-full">
              <PlayCircle className="w-5 h-5 mr-2" />
              {isGenerating ? 'Genererar…' : 'Kör end-to-end test'}
            </ModernButton>
          ) : (
            <div className="space-y-3">
              <audio controls src={generatedAudioUrl} className="w-full" />
              <div className="flex gap-2">
                <ModernButton onClick={() => downloadPodcast(generatedAudioUrl, 'e2e-test.mp3')} variant="glass" className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Ladda ner
                </ModernButton>
                <ModernButton onClick={() => window.open(generatedAudioUrl, '_blank')} className="flex-1">
                  Öppna URL
                </ModernButton>
              </div>
            </div>
          )}
          <p className="text-xs opacity-80">
            Panelen visas bara när ?test=1 i URL:en. Toggle: Lägg till eller ta bort parameter i adressfältet.
          </p>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}
