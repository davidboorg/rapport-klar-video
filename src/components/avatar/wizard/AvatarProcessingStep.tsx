
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAvatars, Avatar } from '@/hooks/useAvatars';
import { useNavigate } from 'react-router-dom';

// Type definitions
interface WizardData {
  avatarName?: string;
  avatarId?: string;
  videoFile?: File;
  voiceSettings?: object;
  customizations?: object;
}

interface AvatarProcessingStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
}

type ProcessingPhase = 'uploading' | 'processing' | 'completed' | 'error';

const AvatarProcessingStep: React.FC<AvatarProcessingStepProps> = ({
  onNext,
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const { toast } = useToast();
  const { createAvatar, updateAvatarStatus } = useAvatars();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('uploading');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(25);
  const [totalEstimatedTime] = useState(25);
  const [createdAvatar, setCreatedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    // Simulate upload process
    if (currentPhase === 'uploading') {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setCurrentPhase('processing');
            setEstimatedTimeRemaining(22); // Reset for processing phase
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
    // Simulate processing and create actual avatar
    if (currentPhase === 'processing') {
      const processingInterval = setInterval(async () => {
        setProcessingProgress(prev => {
          const newProgress = prev + Math.random() * 3 + 1; // Slower, more realistic progress
          
          if (newProgress >= 100) {
            clearInterval(processingInterval);
            // Create actual avatar in database
            createActualAvatar();
            return 100;
          }
          
          // Calculate estimated time remaining based on progress
          const remaining = Math.ceil(((100 - newProgress) / 100) * totalEstimatedTime);
          setEstimatedTimeRemaining(Math.max(0, remaining));
          
          return newProgress;
        });
      }, 2000); // Update every 2 seconds for more realistic feel

      return () => clearInterval(processingInterval);
    }
  }, [currentPhase, totalEstimatedTime]);

  const createActualAvatar = async () => {
    try {
      const avatarName = wizardData.avatarName || 'Min Avatar';
      const avatar = await createAvatar(avatarName);
      
      if (avatar) {
        // Update avatar status to completed
        await updateAvatarStatus(avatar.id, 'completed');
        setCreatedAvatar(avatar);
        setCurrentPhase('completed');
        setEstimatedTimeRemaining(0);
        updateWizardData({ avatarId: avatar.id });
        toast({
          title: "Avatar skapad!",
          description: `${avatarName} har skapats och är redo för användning.`,
        });
      } else {
        throw new Error('Kunde inte skapa avatar');
      }
    } catch (error) {
      console.error('Error creating avatar:', error);
      setCurrentPhase('error');
      toast({
        title: "Fel vid skapande",
        description: "Kunde inte skapa din avatar. Försök igen.",
        variant: "destructive",
      });
    }
  };

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
        return `AI-modellen analyserar och skapar din avatar. Beräknad tid kvar: ${estimatedTimeRemaining} ${estimatedTimeRemaining === 1 ? 'minut' : 'minuter'}`;
      case 'completed':
        return 'Din professionella avatar är nu redo och sparad i ditt avatar-bibliotek';
      case 'error':
        return 'Kontakta support om problemet kvarstår';
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes === 0) return 'Färdig!';
    if (minutes < 1) return 'Mindre än 1 minut kvar';
    return `${minutes} ${minutes === 1 ? 'minut' : 'minuter'} kvar`;
  };

  const isCompleted = currentPhase === 'completed';
  const isProcessing = currentPhase === 'processing';

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
                <div className="text-center text-sm text-muted-foreground">
                  Laddar upp video säkert...
                </div>
              </div>
            )}

            {/* Processing Progress */}
            {currentPhase === 'processing' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avatar creation progress</span>
                    <span>{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-3" />
                </div>
                
                {/* Time Remaining Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Tid kvar:</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {formatTimeRemaining(estimatedTimeRemaining)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    Avatar-skapandet pågår. Processen kan inte avbrytas eller pausas.
                  </div>
                </div>
              </div>
            )}

            {/* Completed Progress */}
            {isCompleted && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avatar creation progress</span>
                  <span>100%</span>
                </div>
                <Progress value={100} className="h-3" />
                <div className="text-center text-sm text-green-600 font-medium">
                  Avatar skapad framgångsrikt!
                </div>
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

            {/* Completion Preview with Next Steps */}
            {isCompleted && createdAvatar && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">Avatar Skapad!</h4>
                          <p className="text-sm text-green-700">
                            "{wizardData.avatarName}" är nu tillgänglig i ditt avatar-bibliotek
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/avatars')} variant="outline" className="border-green-300">
                        Visa Avatar
                      </Button>
                    </div>

                    {/* Next Steps */}
                    <div className="border-t border-green-200 pt-4">
                      <h5 className="font-medium text-green-900 mb-2">Nästa steg:</h5>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>✓ Avatar skapad och sparad</p>
                        <p>→ Ladda upp din kvartalsrapport för att skapa en personlig video</p>
                      </div>
                      <Button 
                        onClick={() => navigate('/projects')} 
                        className="mt-3 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Skapa Kvartalsrapport
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {currentPhase === 'error' && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-900">Något gick fel</h4>
                      <p className="text-sm text-red-700">
                        Din avatar kunde inte skapas. Försök igen eller kontakta support.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => setCurrentPhase('uploading')} variant="outline" className="border-red-300">
                      Försök igen
                    </Button>
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
        <Button variant="outline" onClick={onPrevious} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Föregående
        </Button>
        
        {isCompleted ? (
          <div className="space-x-2">
            <Button onClick={() => navigate('/projects')} variant="outline">
              Skapa Rapport
            </Button>
            <Button onClick={onNext} size="lg">
              Fortsätt till Röst
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onNext}
            disabled={!isCompleted}
            size="lg"
          >
            Fortsätt till Röst
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export { AvatarProcessingStep };
