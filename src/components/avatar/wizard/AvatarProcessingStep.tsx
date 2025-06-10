
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAvatars } from '@/hooks/useAvatars';
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
  const { createAvatar, updateAvatarStatus } = useAvatars();
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

  const handleRetry = () => {
    setCurrentPhase('uploading');
    setUploadProgress(0);
    setProcessingProgress(0);
    setEstimatedTimeRemaining(25);
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
            {getPhaseDescription(currentPhase, estimatedTimeRemaining)}
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
