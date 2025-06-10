
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Play, StopCircle, RotateCcw, ArrowRight, ArrowLeft, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSetupStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const voiceScripts = [
  {
    title: "Neutral Presentation",
    emotion: "Professional",
    content: "Välkomna till vår kvartalsrapport. Idag ska vi gå igenom våra finansiella resultat och diskutera våra framtidsutsikter. Låt oss börja med att titta på våra nyckeltal."
  },
  {
    title: "Entusiastisk Ton",
    emotion: "Positive",
    content: "Jag är mycket glad över att kunna presentera våra starka resultat för detta kvartal! Vi har överträffat våra förväntningar och ser ljust på framtiden."
  },
  {
    title: "Seriös Analys", 
    emotion: "Analytical",
    content: "Låt mig ge er en detaljerad genomgång av våra finansiella nyckeltal. Som ni kan se i diagrammet har vi en tydlig uppåtgående trend inom flera områden."
  }
];

const VoiceSetupStep: React.FC<VoiceSetupStepProps> = ({
  onNext,
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const { toast } = useToast();
  const [selectedScript, setSelectedScript] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudios, setRecordedAudios] = useState<{ [key: number]: Blob }>({});
  const [processingProgress, setProcessingProgress] = useState(0);
  const [voiceQuality, setVoiceQuality] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async (scriptIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudios(prev => ({
          ...prev,
          [scriptIndex]: blob
        }));
        
        // Simulate voice quality analysis
        setTimeout(() => {
          const quality = Math.floor(Math.random() * 25) + 75; // 75-100
          setVoiceQuality(quality);
          updateWizardData({ 
            voiceSettings: { 
              quality, 
              recordings: { ...recordedAudios, [scriptIndex]: blob }
            }
          });
        }, 1500);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSelectedScript(scriptIndex);

      toast({
        title: "Röstinspelning startad",
        description: "Läs texten naturligt och tydligt",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Fel",
        description: "Kunde inte starta röstinspelning",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
  };

  const playRecording = (scriptIndex: number) => {
    const audio = recordedAudios[scriptIndex];
    if (audio && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audio);
      audioRef.current.play();
    }
  };

  const processVoiceCloning = async () => {
    setProcessingProgress(0);
    
    // Simulate voice processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Röstkloning slutförd!",
            description: "Din röst är nu integrerad med avataren",
          });
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 800);
  };

  const recordingsCount = Object.keys(recordedAudios).length;
  const isComplete = recordingsCount >= 2 && voiceQuality && voiceQuality >= 70;

  return (
    <div className="space-y-6">
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Voice Recording Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Röstinspelning för Kloning</span>
          </CardTitle>
          <CardDescription>
            Spela in minst 2 olika tonfall för bästa röstkloning (rekommenderat: alla 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {voiceScripts.map((script, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{script.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {script.emotion}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {recordedAudios[index] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playRecording(index)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!isRecording ? (
                        <Button
                          variant={recordedAudios[index] ? "outline" : "default"}
                          size="sm"
                          onClick={() => startRecording(index)}
                        >
                          <Mic className="h-4 w-4 mr-1" />
                          {recordedAudios[index] ? "Spela in igen" : "Spela in"}
                        </Button>
                      ) : selectedScript === index ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stopRecording}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stoppa
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {script.content}
                    </p>
                  </div>
                  {recordedAudios[index] && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <Volume2 className="h-4 w-4 mr-1" />
                      Inspelning klar
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Quality Analysis */}
      {voiceQuality && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Röstkvalitetsanalys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Övergripande kvalitet:</span>
                <Badge className={voiceQuality >= 85 ? 'bg-green-100 text-green-800' : 
                                voiceQuality >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}>
                  {voiceQuality}%
                </Badge>
              </div>
              <Progress value={voiceQuality} className="h-3" />
              <div className="text-sm space-y-1">
                <p>✅ Ljudkvalitet: Utmärkt</p>
                <p>✅ Tydlighet: Mycket bra</p>
                <p>✅ Konsistens: {recordingsCount >= 3 ? 'Perfekt' : 'Bra'}</p>
                {recordingsCount < 3 && (
                  <p className="text-yellow-700">⚠️ Rekommendation: Spela in fler samples för bättre variation</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Processing */}
      {isComplete && processingProgress === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Klar för Röstkloning</CardTitle>
            <CardDescription>
              Starta processen för att integrera din röst med avataren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={processVoiceCloning}
              size="lg"
              className="w-full"
            >
              <Mic className="h-5 w-5 mr-2" />
              Starta Röstkloning
            </Button>
          </CardContent>
        </Card>
      )}

      {processingProgress > 0 && processingProgress < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Bearbetar Röstkloning...</CardTitle>
            <CardDescription>
              ElevenLabs AI analyserar och klonar din röst
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bearbetning</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Föregående
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!isComplete || processingProgress < 100}
          size="lg"
        >
          Slutför Setup
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { VoiceSetupStep };
