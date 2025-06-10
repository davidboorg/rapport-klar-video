
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarProcessingStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const AvatarProcessingStep: React.FC<AvatarProcessingStepProps> = ({
  onNext,
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'uploading' | 'processing' | 'completed' | 'error'>('uploading');
  const [estimatedTime, setEstimatedTime] = useState(25);

  useEffect(() => {
    // Simulate upload process
    if (currentPhase === 'uploading') {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setCurrentPhase('processing');
            toast({
              title: "Upload slutförd",
              description: "Påbörjar avatar-skapande...",
            });
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 800);

      return () => clearInterval(uploadInterval);
    }
  }, [currentPhase, toast]);

  useEffect(() => {
    // Simulate processing
    if (currentPhase === 'processing') {
      const processingInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const newProgress = prev + Math.random() * 8;
          
          if (newProgress >= 100) {
            clearInterval(processingInterval);
            setCurrentPhase('completed');
            updateWizardData({ avatarId: 'avatar_' + Date.now() });
            toast({
              title: "Avatar skapad!",
              description: "Din professionella avatar är nu klar för användning.",
            });
            return 100;
          }
          
          // Update estimated time
          const remaining = Math.ceil((100 - newProgress) / 4);
          setEstimatedTime(remaining);
          
          return newProgress;
        });
      }, 1200);

      return () => clearInterval(processingInterval);
    }
  }, [currentPhase, updateWizardData, toast]);

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'uploading':
        return <Upload className="h-6 w-6 text-blue-600 animate-pulse" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-orange-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'uploading':
        return 'Laddar upp video...';
      case 'processing':
        return 'Skapar din avatar...';
      case 'completed':
        return 'Avatar skapad!';
      case 'error':
        return 'Ett fel uppstod';
    }
  };

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 'uploading':
        return 'Din video laddas upp säkert till våra servrar';
      case 'processing':
        return `AI-modellen analyserar och skapar din avatar. Beräknad tid: ${estimatedTime} minuter`;
      case 'completed':
        return 'Din professionella avatar är nu redo för röstintegration';
      case 'error':
        return 'Kontakta support om problemet kvarstår';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Processing Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getPhaseIcon()}
          </div>
          <CardTitle className="text-xl">{getPhaseTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getPhaseDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Upload Progress */}
            {currentPhase === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
            )}

            {/* Processing Progress */}
            {(currentPhase === 'processing' || currentPhase === 'completed') && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avatar creation progress</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-3" />
              </div>
            )}

            {/* Processing Steps */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Bearbetningssteg:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Video analys</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 30 ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> :
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    }
                    <span>Ansiktsigenkänning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 60 ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> :
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    }
                    <span>3D-modellering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingProgress > 85 ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> :
                      <div className="h-4 w-4 border-2 border-muted rounded-full" />
                    }
                    <span>Kvalitetskontroll</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Teknisk Information:</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• HD video processing</p>
                  <p>• AI facial mapping</p>
                  <p>• Gesture analysis</p>
                  <p>• Quality optimization</p>
                </div>
              </div>
            </div>

            {/* Completion Preview */}
            {currentPhase === 'completed' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Avatar Skapad!</h4>
                      <p className="text-sm text-green-700">
                        Din professionella avatar "{wizardData.avatarName}" är nu redo.
                        Nästa steg är att integrera din röst för komplett funktionalitet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vad händer bakom kulisserna?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <Upload className="h-8 w-8 text-blue-600 mx-auto" />
              <h4 className="font-medium">Säker Upload</h4>
              <p className="text-xs text-muted-foreground">
                Din video krypteras och laddas upp säkert till våra servrar
              </p>
            </div>
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 text-orange-600 mx-auto" />
              <h4 className="font-medium">AI-bearbetning</h4>
              <p className="text-xs text-muted-foreground">
                Avancerad AI analyserar ditt utseende och rörelser
              </p>
            </div>
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h4 className="font-medium">Kvalitetskontroll</h4>
              <p className="text-xs text-muted-foreground">
                Automatisk kvalitetskontroll för professionella resultat
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled={currentPhase !== 'completed'}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Föregående
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={currentPhase !== 'completed'}
          size="lg"
        >
          Fortsätt till Röst
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { AvatarProcessingStep };
