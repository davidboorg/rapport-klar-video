
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAvatars } from '@/hooks/useAvatars';
import { supabase } from '@/integrations/supabase/client';
import { WizardStepProps, ProcessingPhase, Avatar } from './types';
import { getPhaseIcon, getPhaseTitle, getPhaseDescription } from './processingUtils';
import { UploadProgress } from './processing/UploadProgress';
import { ProcessingProgress } from './processing/ProcessingProgress';
import { CompletedProgress } from './processing/CompletedProgress';
import { ProcessingSteps } from './processing/ProcessingSteps';
import { CompletionPreview } from './processing/CompletionPreview';
import { ErrorState } from './processing/ErrorState';
import { TechnicalDetails } from './processing/TechnicalDetails';
import { Navigation } from './processing/Navigation';

const AvatarProcessingStep: React.FC<WizardStepProps> = ({
  onNext,
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const { toast } = useToast();
  const { createAvatar } = useAvatars();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('uploading');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(25);
  const [totalEstimatedTime] = useState(25);
  const [createdAvatar, setCreatedAvatar] = useState<Avatar | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Simulate upload process
    if (currentPhase === 'uploading') {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setCurrentPhase('processing');
            setEstimatedTimeRemaining(22);
            toast({
              title: "Upload slutförd",
              description: "Påbörjar avatar-skapande med HeyGen...",
            });
            // Start actual avatar creation
            createAvatarWithHeyGen();
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 800);

      return () => clearInterval(uploadInterval);
    }
  }, [currentPhase, toast]);

  const createAvatarWithHeyGen = async () => {
    try {
      const avatarName = wizardData.avatarName || 'Min Avatar';
      
      console.log('Creating avatar with name:', avatarName);
      
      // First create avatar in database
      const avatar = await createAvatar(avatarName);
      
      if (!avatar) {
        throw new Error('Kunde inte skapa avatar i databasen');
      }

      console.log('Avatar created in database:', avatar.id);
      
      // Simulate a video URL for now (in real implementation, this would be the uploaded video)
      const mockVideoUrl = 'https://example.com/training-video.mp4';
      
      // Call HeyGen API via Edge Function
      console.log('Calling HeyGen API for avatar:', avatar.id);
      
      const { data, error } = await supabase.functions.invoke('create-heygen-avatar', {
        body: { 
          avatarId: avatar.id,
          videoUrl: mockVideoUrl
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`HeyGen API fel: ${error.message}`);
      }

      if (!data?.success) {
        console.error('HeyGen API error response:', data);
        throw new Error(`HeyGen API misslyckades: ${data?.error || 'Okänt fel'}`);
      }

      console.log('HeyGen avatar created successfully:', data);
      
      setCreatedAvatar(avatar);
      setCurrentPhase('completed');
      setEstimatedTimeRemaining(0);
      setProcessingProgress(100);
      
      updateWizardData({ avatarId: avatar.id });
      
      toast({
        title: "Avatar skapad!",
        description: `${avatarName} har skapats med HeyGen och är redo för användning.`,
      });

    } catch (error) {
      console.error('Error creating avatar with HeyGen:', error);
      setCurrentPhase('error');
      setErrorMessage(error instanceof Error ? error.message : 'Okänt fel uppstod');
      toast({
        title: "Fel vid skapande",
        description: "Kunde inte skapa din avatar med HeyGen. Försök igen.",
        variant: "destructive",
      });
    }
  };

  // Simulate processing progress updates during HeyGen processing
  useEffect(() => {
    if (currentPhase === 'processing') {
      const processingInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            // Don't go to 100% here, let the actual API call complete first
            return prev;
          }
          
          const newProgress = prev + Math.random() * 2 + 0.5; // Slower progress
          
          // Calculate estimated time remaining based on progress
          const remaining = Math.ceil(((100 - newProgress) / 100) * totalEstimatedTime);
          setEstimatedTimeRemaining(Math.max(0, remaining));
          
          return newProgress;
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(processingInterval);
    }
  }, [currentPhase, totalEstimatedTime]);

  const handleRetry = () => {
    setCurrentPhase('uploading');
    setUploadProgress(0);
    setProcessingProgress(0);
    setEstimatedTimeRemaining(25);
    setErrorMessage('');
    setCreatedAvatar(null);
  };

  const isCompleted = currentPhase === 'completed';
  const isProcessing = currentPhase === 'processing';

  return (
    <div className="space-y-6">
      {/* Main Processing Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getPhaseIcon(currentPhase)}
          </div>
          <CardTitle className="text-xl">{getPhaseTitle(currentPhase)}</CardTitle>
          <CardDescription className="text-base">
            {currentPhase === 'error' && errorMessage ? 
              errorMessage : 
              getPhaseDescription(currentPhase, estimatedTimeRemaining)
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Upload Progress */}
            {currentPhase === 'uploading' && (
              <UploadProgress progress={uploadProgress} />
            )}

            {/* Processing Progress */}
            {currentPhase === 'processing' && (
              <ProcessingProgress 
                progress={processingProgress} 
                estimatedTimeRemaining={estimatedTimeRemaining}
              />
            )}

            {/* Completed Progress */}
            {isCompleted && <CompletedProgress />}

            {/* Processing Steps */}
            <ProcessingSteps processingProgress={processingProgress} />

            {/* Completion Preview with Next Steps */}
            {isCompleted && createdAvatar && (
              <CompletionPreview 
                avatar={createdAvatar} 
                avatarName={wizardData.avatarName || 'Min Avatar'} 
              />
            )}

            {/* Error State */}
            {currentPhase === 'error' && <ErrorState onRetry={handleRetry} />}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <TechnicalDetails />

      {/* Navigation */}
      <Navigation 
        onNext={onNext}
        onPrevious={onPrevious}
        isCompleted={isCompleted}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export { AvatarProcessingStep };
