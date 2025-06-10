
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Video, StopCircle, RotateCcw, Upload, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarRecordingStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const suggestedScripts = [
  {
    title: "Professionell Presentation",
    content: "Hej, jag heter [Ditt namn] och jag är [Din titel] på [Företag]. Idag ska jag presentera våra kvartalsresultat och ge er en översikt av våra framtidsutsikter. Låt oss börja med att titta på våra nyckeltal för detta kvartal."
  },
  {
    title: "Företagsintroduktion", 
    content: "Välkomna till [Företag]. Som [Din titel] är jag stolt över att kunna dela våra senaste resultat med er. Vi har arbetat hårt för att leverera stark tillväxt och skapa värde för våra aktieägare."
  },
  {
    title: "Finansiell Översikt",
    content: "Låt mig guida er genom våra finansiella resultat. Som ni kommer att se har vi uppnått starka siffror inom flera nyckelområden, och jag ser fram emot att diskutera våra strategiska initiativ för kommande kvartalet."
  }
];

const AvatarRecordingStep: React.FC<AvatarRecordingStepProps> = ({
  onNext,
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedScript, setSelectedScript] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        updateWizardData({ videoFile: blob });
        
        // Simulate quality analysis
        setTimeout(() => {
          const score = Math.floor(Math.random() * 30) + 70; // 70-100
          setQualityScore(score);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Inspelning startad",
        description: "Tala naturligt och titta in i kameran",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Fel",
        description: "Kunde inte starta inspelning. Kontrollera kameratillstånd.",
        variant: "destructive",
      });
    }
  }, [toast, updateWizardData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      toast({
        title: "Inspelning slutförd",
        description: "Analyserar videokvalitet...",
      });
    }
  }, [isRecording, toast]);

  const resetRecording = () => {
    setRecordedBlob(null);
    setQualityScore(null);
    setRecordingTime(0);
    updateWizardData({ videoFile: null });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Script Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5" />
            <span>Välj Presentation Script</span>
          </CardTitle>
          <CardDescription>
            Välj ett fördefinierat script eller använd ditt eget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {suggestedScripts.map((script, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-colors ${
                  selectedScript === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedScript(index)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{script.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {script.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Valt Script:</h4>
            <p className="text-sm leading-relaxed">
              {suggestedScripts[selectedScript].content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Video Inspelning</CardTitle>
          <CardDescription>
            Spela in din professionella presentation (2-5 minuter rekommenderat)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge variant="destructive">
                    REC {formatTime(recordingTime)}
                  </Badge>
                </div>
              )}

              {qualityScore && (
                <div className="absolute top-4 right-4">
                  <Badge className={getQualityColor(qualityScore)}>
                    Kvalitet: {qualityScore}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording && !recordedBlob && (
                <Button onClick={startRecording} size="lg" className="min-w-[140px]">
                  <Camera className="h-5 w-5 mr-2" />
                  Starta Inspelning
                </Button>
              )}

              {isRecording && (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <StopCircle className="h-5 w-5 mr-2" />
                  Stoppa Inspelning
                </Button>
              )}

              {recordedBlob && (
                <div className="flex space-x-2">
                  <Button onClick={resetRecording} variant="outline">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Spela In Igen
                  </Button>
                </div>
              )}
            </div>

            {/* Quality Feedback */}
            {qualityScore && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Kvalitetsanalys:</span>
                    <Badge className={getQualityColor(qualityScore)}>
                      {qualityScore}%
                    </Badge>
                  </div>
                  <Progress value={qualityScore} className="mb-3" />
                  <div className="text-sm space-y-1">
                    {qualityScore >= 85 && (
                      <p className="text-green-700">✅ Utmärkt kvalitet! Klar för avatar-skapande.</p>
                    )}
                    {qualityScore >= 70 && qualityScore < 85 && (
                      <p className="text-yellow-700">⚠️ Bra kvalitet. Överväg att spela in igen för bättre resultat.</p>
                    )}
                    {qualityScore < 70 && (
                      <p className="text-red-700">❌ Låg kvalitet. Rekommenderar ny inspelning med bättre belysning.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Föregående
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!recordedBlob || (qualityScore && qualityScore < 60)}
          size="lg"
        >
          Nästa Steg
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { AvatarRecordingStep };
