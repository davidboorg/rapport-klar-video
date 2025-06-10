
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Camera, Mic, Settings, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { AvatarWelcomeStep } from './wizard/AvatarWelcomeStep';
import { AvatarRecordingStep } from './wizard/AvatarRecordingStep';
import { AvatarProcessingStep } from './wizard/AvatarProcessingStep';
import { VoiceSetupStep } from './wizard/VoiceSetupStep';
import { AvatarCustomizationStep } from './wizard/AvatarCustomizationStep';
import { useNavigate } from 'react-router-dom';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<WizardStepProps>;
}

interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: "Välkommen & Riktlinjer",
    description: "Professionell avatar-setup guide",
    icon: <CheckCircle className="h-5 w-5" />,
    component: AvatarWelcomeStep
  },
  {
    id: 2,
    title: "Video Inspelning",
    description: "Spela in din professionella avatar",
    icon: <Camera className="h-5 w-5" />,
    component: AvatarRecordingStep
  },
  {
    id: 3,
    title: "Bearbetning & Preview",
    description: "Avatar skapas och optimeras",
    icon: <Settings className="h-5 w-5" />,
    component: AvatarProcessingStep
  },
  {
    id: 4,
    title: "Röst Integration",
    description: "Spela in och klona din röst",
    icon: <Mic className="h-5 w-5" />,
    component: VoiceSetupStep
  },
  {
    id: 5,
    title: "Anpassningar",
    description: "Professionella inställningar",
    icon: <Settings className="h-5 w-5" />,
    component: AvatarCustomizationStep
  }
];

const AvatarSetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    avatarName: '',
    videoFile: null,
    avatarId: null,
    voiceSettings: {},
    customizations: {}
  });

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard completed, go to avatars
      navigate('/avatars');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateWizardData = (newData: any) => {
    setWizardData(prev => ({ ...prev, ...newData }));
  };

  const handleBackToAvatars = () => {
    navigate('/avatars');
  };

  const CurrentStepComponent = currentStepData?.component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Skapa Din Professionella Avatar</h1>
            <p className="text-muted-foreground">
              Följ vår guide för att skapa en högkvalitativ AI-avatar som representerar dig professionellt
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToAvatars}>
            <Home className="h-4 w-4 mr-2" />
            Tillbaka till Avatarer
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Framsteg</CardTitle>
            <Badge variant="outline">
              Steg {currentStep} av {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  step.id === currentStep ? 'text-primary' : 
                  step.id < currentStep ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-full border-2 ${
                  step.id === currentStep ? 'border-primary bg-primary/10' :
                  step.id < currentStep ? 'border-green-600 bg-green-600/10' : 'border-muted'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium hidden sm:block">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
          <CardDescription>{currentStepData?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={handleNext}
              onPrevious={handlePrevious}
              wizardData={wizardData}
              updateWizardData={updateWizardData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarSetupWizard;
