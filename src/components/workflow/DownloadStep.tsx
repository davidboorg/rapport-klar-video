
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, RotateCcw } from 'lucide-react';

interface DownloadStepProps {
  audioUrl: string | null;
  videoUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
}

const DownloadStep: React.FC<DownloadStepProps> = ({ 
  audioUrl, 
  videoUrl, 
  onDownload, 
  onReset 
}) => {
  const handleDownloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'podcast.mp3';
      link.click();
      onDownload();
    }
  };

  const handleDownloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'video.mp4';
      link.click();
      onDownload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Klar för nedladdning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Fantastiskt! Både podcast och video är klara för nedladdning.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Podcast</h4>
              <p className="text-sm text-green-600 mb-3">
                Ljudfil redo för nedladdning
              </p>
              <Button 
                onClick={handleDownloadAudio}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Ladda ner MP3
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Video</h4>
              <p className="text-sm text-blue-600 mb-3">
                Video med avatar redo
              </p>
              <Button 
                onClick={handleDownloadVideo}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Ladda ner MP4
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button 
              onClick={onReset}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Starta ny workflow
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadStep;
