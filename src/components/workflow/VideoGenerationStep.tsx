
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoGenerationStepProps {
  script: string;
  videoUrl: string | null;
}

const VideoGenerationStep: React.FC<VideoGenerationStepProps> = ({ 
  script, 
  videoUrl 
}) => {
  const handlePlayVideo = () => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.controls = true;
      video.style.width = '100%';
      video.style.maxWidth = '500px';
      
      const dialog = document.createElement('dialog');
      dialog.style.padding = '20px';
      dialog.style.border = 'none';
      dialog.style.borderRadius = '8px';
      dialog.appendChild(video);
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Stäng';
      closeBtn.style.marginTop = '10px';
      closeBtn.onclick = () => {
        dialog.close();
        document.body.removeChild(dialog);
      };
      dialog.appendChild(closeBtn);
      
      document.body.appendChild(dialog);
      dialog.showModal();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Generera video
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!videoUrl ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 mb-2">
              Genererar video med avatar...
            </p>
            <p className="text-sm text-gray-500">
              Detta kan ta några minuter
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Videon är klar! Du kan förhandsgranska den nedan.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handlePlayVideo}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Förhandsgranska
                </Button>
                <span className="text-sm text-gray-600">
                  Video med avatar
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoGenerationStep;
