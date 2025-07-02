
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvatars } from '@/hooks/useAvatars';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, Video, Mic, User, CheckCircle, Lightbulb, Camera } from 'lucide-react';

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
    description: "Basic information about your avatar",
    icon: <User className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Video Recording",
    description: "Record training video for your avatar",
    icon: <Video className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Voice Sample",
    description: "Record voice sample for natural speech",
    icon: <Mic className="h-5 w-5" />
  },
  {
    id: 4,
    title: "Processing",
    description: "Your avatar is being created and trained",
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
          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="avatarName" className="text-lg font-medium text-white">Avatar Name</Label>
              <Input
                id="avatarName"
                placeholder="e.g. Professional Presentation Avatar"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                className="h-12 text-lg bg-white/5 border-white/20 text-white placeholder:text-slate-400"
              />
              <p className="text-slate-300">
                Choose a descriptive name for your avatar
              </p>
            </div>
            
            <ModernCard variant="glass" className="p-6">
              <ModernCardHeader className="pb-4">
                <ModernCardTitle className="flex items-center space-x-2 text-blue-400">
                  <Lightbulb className="h-5 w-5" />
                  <span>Tips for Best Results</span>
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-3">
                <div className="grid gap-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Choose a clear, professional background</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Ensure you have good lighting</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Look directly into the camera</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Speak clearly and naturally</span>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur">
                <div className="text-center space-y-4">
                  <Video className="h-20 w-20 text-slate-400 mx-auto" />
                  <p className="text-slate-300 text-lg">
                    Record a 2-5 minute video where you speak naturally
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <ModernButton size="lg" className="w-full group">
                <Camera className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Recording
              </ModernButton>
              
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">or</p>
              </div>
              
              <ModernButton variant="glass" size="lg" className="w-full">
                <Upload className="h-5 w-5 mr-2" />
                Upload Video
              </ModernButton>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mx-auto flex items-center justify-center backdrop-blur border border-white/10">
                <Mic className="h-20 w-20 text-purple-400" />
              </div>
              <p className="text-slate-300 text-lg">
                Record a 1-2 minute voice sample for voice cloning
              </p>
            </div>
            
            <div className="space-y-6">
              <ModernButton size="lg" className="w-full">
                <Mic className="h-5 w-5 mr-2" />
                Record Voice
              </ModernButton>
              
              <ModernCard variant="glass" className="p-6">
                <ModernCardHeader className="pb-4">
                  <ModernCardTitle className="text-green-400">Voice Recording Tips</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">Use a quiet environment</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">Speak at normal pace</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">Include different emotions</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">Read text naturally</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-6">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center backdrop-blur border border-white/10">
                <Upload className="h-20 w-20 text-blue-400 animate-bounce" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Creating your avatar...</h3>
                <p className="text-slate-300 text-lg max-w-md mx-auto">
                  This may take 10-15 minutes. You'll receive a notification when your avatar is ready.
                </p>
              </div>
            </div>
            
            <ModernButton 
              onClick={handleCreateAvatar}
              disabled={isProcessing || !avatarName.trim()}
              size="xl"
              className="min-w-[200px]"
            >
              {isProcessing ? 'Creating Avatar...' : 'Create Avatar'}
            </ModernButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <ModernButton variant="glass" onClick={() => navigate('/avatars')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Avatars
          </ModernButton>
          
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Create New Avatar
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Follow our guide to create a high-quality AI avatar that represents you professionally
              </p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <ModernCard className="mb-8 p-6" variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Progress</h3>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-8 h-2" />
          
          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`text-center space-y-3 ${
                  step.id === currentStep ? 'text-blue-400' : 
                  step.id < currentStep ? 'text-green-400' : 'text-slate-500'
                }`}
              >
                <div className={`mx-auto w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  step.id === currentStep ? 'border-blue-400 bg-blue-400/10' :
                  step.id < currentStep ? 'border-green-400 bg-green-400/10' : 'border-slate-600 bg-slate-800/50'
                }`}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-medium hidden sm:block">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Current Step Content */}
        <ModernCard className="p-8" variant="glass">
          <ModernCardHeader className="mb-8">
            <ModernCardTitle className="text-2xl text-white">{steps[currentStep - 1]?.title}</ModernCardTitle>
            <p className="text-slate-300 text-lg mt-2">{steps[currentStep - 1]?.description}</p>
          </ModernCardHeader>
          
          <ModernCardContent>
            {renderStepContent()}
          </ModernCardContent>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <ModernButton 
              variant="glass" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </ModernButton>
            
            {currentStep < steps.length && (
              <ModernButton 
                onClick={handleNext}
                disabled={currentStep === 1 && !avatarName.trim()}
                size="lg"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </ModernButton>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default AvatarCreationWizard;
