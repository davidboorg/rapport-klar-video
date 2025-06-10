
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvatars } from '@/hooks/useAvatars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, Video, Mic, User } from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: "Avatar Information",
    description: "Grundläggande information om din avatar",
    icon: <User className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Video Recording",
    description: "Spela in träningsvideo för din avatar",
    icon: <Video className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Voice Sample",
    description: "Spela in röstprov för naturlig tal",
    icon: <Mic className="h-5 w-5" />
  },
  {
    id: 4,
    title: "Processing",
    description: "Din avatar skapas och tränas",
    icon: <Upload className="h-5 w-5" />
  }
];

const AvatarCreationWizard = () => {
  const navigate = useNavigate();
  const { createAvatar } = useAvatars();
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarName, setAvatarName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAvatar = async () => {
    if (!avatarName.trim()) return;
    
    setIsProcessing(true);
    const avatar = await createAvatar(avatarName);
    
    if (avatar) {
      navigate('/avatars');
    }
    setIsProcessing(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="avatarName">Avatar Namn</Label>
              <Input
                id="avatarName"
                placeholder="T.ex. Professionell Presentation"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Välj ett beskrivande namn för din avatar
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tips för bästa resultat:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Välj en tydlig, professionell bakgrund</li>
                <li>• Se till att du har bra belysning</li>
                <li>• Titta direkt in i kameran</li>
                <li>• Tala tydligt och naturligt</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                <Video className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Spela in en 2-5 minuter lång video där du pratar naturligt
              </p>
            </div>
            
            <div className="space-y-4">
              <Button className="w-full" size="lg">
                <Video className="h-5 w-5 mr-2" />
                Börja Inspelning
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">eller</p>
              </div>
              
              <Button variant="outline" className="w-full" size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Ladda Upp Video
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Mic className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Spela in ett röstprov på 1-2 minuter för röstkloning
              </p>
            </div>
            
            <div className="space-y-4">
              <Button className="w-full" size="lg">
                <Mic className="h-5 w-5 mr-2" />
                Spela In Röst
              </Button>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Röstinspelningstips:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Använd en tyst miljö</li>
                  <li>• Tala i normal hastighet</li>
                  <li>• Inkludera olika känslor</li>
                  <li>• Läs texten naturligt</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Upload className="h-16 w-16 text-blue-600 animate-bounce" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Skapar din avatar...</h3>
              <p className="text-muted-foreground mb-6">
                Detta kan ta 10-15 minuter. Du får ett meddelande när avataren är klar.
              </p>
            </div>
            
            <Button 
              onClick={handleCreateAvatar}
              disabled={isProcessing || !avatarName.trim()}
              size="lg"
              className="w-full"
            >
              {isProcessing ? 'Skapar avatar...' : 'Skapa Avatar'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/avatars')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka till Avatarer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Skapa Ny Avatar</CardTitle>
            <Badge variant="outline">
              Steg {currentStep} av {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center space-x-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id === currentStep ? 'text-blue-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {step.icon}
                <span className="text-sm font-medium hidden sm:inline">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {steps[currentStep - 1]?.title}
            </h3>
            <CardDescription>
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Föregående
            </Button>
            
            {currentStep < steps.length && (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && !avatarName.trim()}
              >
                Nästa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarCreationWizard;
