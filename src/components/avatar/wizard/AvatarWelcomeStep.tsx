
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
      title: "Professionell Framtoning",
      items: [
        "Använd affärsklädsel eller business casual",
        "Välj en neutral, professionell bakgrund",
        "Se till att du är väl synlig i bild",
        "Titta direkt in i kameran"
      ]
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
      title: "Belysning & Miljö",
      items: [
        "Använd naturligt ljus eller professionell belysning",
        "Undvik motljus och starka skuggor",
        "Välj en tyst miljö utan störande ljud",
        "Säkerställ stabil internetanslutning"
      ]
    },
    {
      icon: <Monitor className="h-5 w-5 text-green-600" />,
      title: "Tekniska Krav",
      items: [
        "HD-kamera (minst 720p, rekommenderat 1080p)",
        "Stabil internetanslutning (minst 10 Mbps)",
        "Chrome eller Safari webbläsare",
        "Mikrofon för röstinspelning"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Name Input */}
      <div className="space-y-2">
        <Label htmlFor="avatarName">Avatar Namn</Label>
        <Input
          id="avatarName"
          placeholder="T.ex. VD Presentation Avatar"
          value={wizardData.avatarName || ''}
          onChange={(e) => updateWizardData({ avatarName: e.target.value })}
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground">
          Välj ett beskrivande namn för din professionella avatar
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
          <CardTitle className="text-blue-900">Avatar Setup Kostnad</CardTitle>
          <CardDescription className="text-blue-700">
            Professionell avatar-skapande med röstkloning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Avatar Setup Fee:</span>
              <span className="text-lg font-bold text-blue-900">2.500 - 5.000 SEK</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Premium Customization:</span>
              <span className="text-sm text-blue-700">+1.000 - 3.000 SEK (valfritt)</span>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                Inkluderar professionell avatar-skapande, röstkloning och grundläggande anpassningar
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
          Nästa Steg
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { AvatarWelcomeStep };
