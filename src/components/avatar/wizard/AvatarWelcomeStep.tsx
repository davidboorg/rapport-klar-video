
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lightbulb, Camera, Monitor, ArrowRight } from 'lucide-react';

interface AvatarWelcomeStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const AvatarWelcomeStep: React.FC<AvatarWelcomeStepProps> = ({
  onNext,
  wizardData,
  updateWizardData
}) => {
  const guidelines = [
    {
      icon: <Camera className="h-5 w-5 text-blue-600" />,
      title: "Professional Appearance",
      items: [
        "Wear business attire or business casual",
        "Choose a neutral, professional background",
        "Ensure you are clearly visible in frame",
        "Look directly into the camera"
      ]
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
      title: "Lighting & Environment",
      items: [
        "Use natural light or professional lighting",
        "Avoid backlighting and harsh shadows",
        "Choose a quiet environment without noise",
        "Ensure stable internet connection"
      ]
    },
    {
      icon: <Monitor className="h-5 w-5 text-green-600" />,
      title: "Technical Requirements",
      items: [
        "HD camera (minimum 720p, recommended 1080p)",
        "Stable internet connection (minimum 10 Mbps)",
        "Chrome or Safari web browser",
        "Microphone for voice recording"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Name Input */}
      <div className="space-y-2">
        <Label htmlFor="avatarName">Avatar Name</Label>
        <Input
          id="avatarName"
          placeholder="e.g. CEO Presentation Avatar"
          value={wizardData.avatarName || ''}
          onChange={(e) => updateWizardData({ avatarName: e.target.value })}
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground">
          Choose a descriptive name for your professional avatar
        </p>
      </div>

      {/* Guidelines Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {guidelines.map((section, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                {section.icon}
                <CardTitle className="text-base">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Avatar Setup Cost</CardTitle>
          <CardDescription className="text-blue-700">
            Professional avatar creation with voice cloning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Avatar Setup Fee:</span>
              <span className="text-lg font-bold text-blue-900">$300 - 600</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Premium Customization:</span>
              <span className="text-sm text-blue-700">+$100 - 300 (optional)</span>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                Includes professional avatar creation, voice cloning and basic customizations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          disabled={!wizardData.avatarName?.trim()}
          size="lg"
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { AvatarWelcomeStep };
