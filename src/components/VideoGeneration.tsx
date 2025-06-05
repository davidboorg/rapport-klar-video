
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Film,
  Wand2
} from "lucide-react";
import VideoTemplateSelector from "./VideoTemplateSelector";
import BrandCustomization from "./BrandCustomization";
import { useVideoGeneration } from "../hooks/useVideoGeneration";

interface VideoGenerationProps {
  projectId: string;
  scriptText: string;
  financialData?: any;
  existingVideoUrl?: string;
}

const VideoGeneration = ({ projectId, scriptText, financialData, existingVideoUrl }: VideoGenerationProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [brandConfig, setBrandConfig] = useState({
    company_name: financialData?.company_name || '',
    primary_color: '#2563eb',
    secondary_color: '#f8fafc'
  });
  const [showTemplateSelector, setShowTemplateSelector] = useState(!existingVideoUrl);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(existingVideoUrl);

  const { isGenerating, generateVideo, getJobProgress } = useVideoGeneration();
  const jobProgress = getJobProgress(projectId);

  const handleGenerateVideo = async () => {
    if (!selectedTemplate || !scriptText.trim()) {
      return;
    }

    try {
      const videoUrl = await generateVideo(
        projectId,
        selectedTemplate.id,
        brandConfig,
        scriptText
      );
      setGeneratedVideoUrl(videoUrl);
      setShowTemplateSelector(false);
    } catch (error) {
      console.error('Failed to generate video:', error);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `${brandConfig.company_name || 'video'}_finansrapport.mp4`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (generatedVideoUrl && navigator.share) {
      try {
        await navigator.share({
          title: `${brandConfig.company_name} - Finansiell rapport`,
          text: 'Kolla in vår senaste finansiella rapport!',
          url: generatedVideoUrl,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(generatedVideoUrl || '');
    }
  };

  if (generatedVideoUrl && !showTemplateSelector) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Genererad AI-video
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-full"
              poster="/placeholder.svg"
            >
              <source src={generatedVideoUrl} type="video/mp4" />
              Din webbläsare stöder inte videouppspelning.
            </video>
          </div>

          {/* Video Info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Video klar!</h4>
                <p className="text-sm text-slate-600">
                  {brandConfig.company_name} - Finansiell rapport
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">Klar</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Ladda ner MP4
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Dela video
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateSelector(true)}
              className="flex-1"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Regenerera
            </Button>
          </div>

          {/* Export Options */}
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2">Exportalternativ</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">1080p MP4</Button>
              <Button variant="outline" size="sm">720p MP4</Button>
              <Button variant="outline" size="sm">GIF</Button>
              <Button variant="outline" size="sm">Audio MP3</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator if generating */}
      {isGenerating && jobProgress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h4 className="font-medium">Genererar video...</h4>
                  <p className="text-sm text-slate-600">Detta tar vanligtvis 2-3 minuter</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{jobProgress.status === 'processing' ? 'Bearbetar script' : 
                         jobProgress.status === 'rendering' ? 'Renderar video' : 'Slutför'}</span>
                  <span>{jobProgress.progress}%</span>
                </div>
                <Progress value={jobProgress.progress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      {showTemplateSelector && (
        <VideoTemplateSelector
          selectedTemplate={selectedTemplate?.id || null}
          onTemplateSelect={setSelectedTemplate}
        />
      )}

      {/* Brand Customization */}
      {selectedTemplate && showTemplateSelector && (
        <BrandCustomization
          brandConfig={brandConfig}
          onBrandConfigChange={setBrandConfig}
        />
      )}

      {/* Generate Button */}
      {selectedTemplate && showTemplateSelector && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Redo att generera video</p>
                  <p className="text-xs text-slate-600">
                    Uppskattat tid: 2-3 minuter
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleGenerateVideo}
                disabled={isGenerating || !scriptText.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                    Genererar video...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Generera AI-video
                  </>
                )}
              </Button>

              {!scriptText.trim() && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Du behöver ett videomanus för att generera video
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoGeneration;
