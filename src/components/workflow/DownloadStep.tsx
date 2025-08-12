
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DownloadStepProps {
  audioUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
}

const DownloadStep: React.FC<DownloadStepProps> = ({ 
  audioUrl, 
  onDownload, 
  onReset 
}) => {
  const { toast } = useToast();

  const handleDownloadAudio = async () => {
    if (!audioUrl) return;

    try {
      // Fetch as blob to avoid cross-origin download issues
      const res = await fetch(audioUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      // Try to derive filename from URL, fallback to default
      const match = audioUrl.split('/').pop()?.split('?')[0];
      const fileName = match && match.endsWith('.mp3') ? match : 'podcast.mp3';
      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke after a tick
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      onDownload();
      toast({ title: 'Nedladdning startad', description: 'Din podcast laddas ner.' });
    } catch (err) {
      console.error('Download failed, opening in new tab as fallback:', err);
      toast({
        title: 'Nedladdning misslyckades',
        description: 'Försöker öppna filen i en ny flik.',
        variant: 'destructive',
      });
      // Fallback: open signed URL in a new tab
      window.open(audioUrl, '_blank');
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
            Klart! Din podcast är redo för nedladdning.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
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
