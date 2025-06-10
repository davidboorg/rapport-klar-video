
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shirt, Monitor, Palette, Mic2, ArrowRight, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AvatarCustomizationStepProps {
  onNext: () => void;
  onPrevious: () => void;
  wizardData: any;
  updateWizardData: (data: any) => void;
}

const attireOptions = [
  { id: 'business-suit', name: 'Business Suit', description: 'Klassisk kostym', price: 'Ingår' },
  { id: 'business-casual', name: 'Business Casual', description: 'Kavaj utan slips', price: 'Ingår' },
  { id: 'polo-shirt', name: 'Polo Shirt', description: 'Professionell polo', price: '+500 SEK' },
  { id: 'custom-branded', name: 'Företagsprofilerad', description: 'Med ert logotyp', price: '+1.500 SEK' }
];

const backgroundOptions = [
  { id: 'office-modern', name: 'Modernt Kontor', description: 'Professionell kontorsmiljö', price: 'Ingår' },
  { id: 'boardroom', name: 'Styrelserum', description: 'Exklusiv mötesmiljö', price: 'Ingår' },
  { id: 'city-view', name: 'Stadsutsikt', description: 'Panoramafönster', price: '+750 SEK' },
  { id: 'custom-office', name: 'Ert Kontor', description: 'Fotografera er verkliga miljö', price: '+2.000 SEK' }
];

const speakingStyles = [
  { id: 'professional', name: 'Professionell', pace: 'Normal', gestures: 'Måttliga' },
  { id: 'authoritative', name: 'Auktoritativ', pace: 'Långsam', gestures: 'Kraftfulla' },
  { id: 'friendly', name: 'Vänlig', pace: 'Livlig', gestures: 'Naturliga' },
  { id: 'analytical', name: 'Analytisk', pace: 'Metodisk', gestures: 'Preciserade' }
];

const AvatarCustomizationStep: React.FC<AvatarCustomizationStepProps> = ({
  onPrevious,
  wizardData,
  updateWizardData
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAttire, setSelectedAttire] = useState('business-suit');
  const [selectedBackground, setSelectedBackground] = useState('office-modern');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [brandSettings, setBrandSettings] = useState({
    primaryColor: '#0066CC',
    logoPosition: 'bottom-right'
  });

  const calculateTotalCost = () => {
    let baseCost = 2500; // Base avatar creation
    
    const attire = attireOptions.find(a => a.id === selectedAttire);
    const background = backgroundOptions.find(b => b.id === selectedBackground);
    
    if (attire?.price.includes('+')) {
      baseCost += parseInt(attire.price.match(/\d+/)?.[0] || '0');
    }
    
    if (background?.price.includes('+')) {
      baseCost += parseInt(background.price.match(/\d+/)?.[0] || '0');
    }
    
    return baseCost;
  };

  const handleFinishSetup = async () => {
    const customizations = {
      attire: selectedAttire,
      background: selectedBackground,
      speakingStyle: selectedStyle,
      brandSettings
    };
    
    updateWizardData({ customizations });
    
    toast({
      title: "Avatar Setup Slutförd!",
      description: `${wizardData.avatarName} är nu redo för användning. Total kostnad: ${calculateTotalCost().toLocaleString()} SEK`,
    });
    
    // Navigate to avatar library
    navigate('/avatars');
  };

  return (
    <div className="space-y-6">
      {/* Customization Tabs */}
      <Tabs defaultValue="attire" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attire" className="flex items-center space-x-1">
            <Shirt className="h-4 w-4" />
            <span className="hidden sm:inline">Klädsel</span>
          </TabsTrigger>
          <TabsTrigger value="background" className="flex items-center space-x-1">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Bakgrund</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center space-x-1">
            <Mic2 className="h-4 w-4" />
            <span className="hidden sm:inline">Presentation</span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center space-x-1">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Varumärke</span>
          </TabsTrigger>
        </TabsList>

        {/* Attire Selection */}
        <TabsContent value="attire" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Välj Klädsel</CardTitle>
              <CardDescription>
                Anpassa din avatars professionella framtoning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {attireOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAttire === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAttire(option.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{option.name}</CardTitle>
                        <Badge variant={option.price === 'Ingår' ? 'default' : 'secondary'}>
                          {option.price}
                        </Badge>
                      </div>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Selection */}
        <TabsContent value="background" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Välj Bakgrund</CardTitle>
              <CardDescription>
                Skapa rätt miljö för dina presentationer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {backgroundOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-colors ${
                      selectedBackground === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedBackground(option.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{option.name}</CardTitle>
                        <Badge variant={option.price === 'Ingår' ? 'default' : 'secondary'}>
                          {option.price}
                        </Badge>
                      </div>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speaking Style */}
        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Presentationsstil</CardTitle>
              <CardDescription>
                Anpassa hur din avatar presenterar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj presentationsstil" />
                  </SelectTrigger>
                  <SelectContent>
                    {speakingStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid gap-4 md:grid-cols-3">
                  {speakingStyles.map((style) => (
                    <Card 
                      key={style.id}
                      className={selectedStyle === style.id ? 'border-primary bg-primary/5' : ''}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{style.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs space-y-1">
                          <p><strong>Taltempo:</strong> {style.pace}</p>
                          <p><strong>Gester:</strong> {style.gestures}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Settings */}
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Varumärkesintegration</span>
              </CardTitle>
              <CardDescription>
                Anpassa avatar med ert företags visuella identitet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Primärfärg</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="color"
                      value={brandSettings.primaryColor}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        primaryColor: e.target.value
                      }))}
                      className="w-12 h-8 rounded border"
                    />
                    <span className="text-sm text-muted-foreground">
                      {brandSettings.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Logotyp Position</label>
                  <Select 
                    value={brandSettings.logoPosition} 
                    onValueChange={(value) => setBrandSettings(prev => ({
                      ...prev,
                      logoPosition: value
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Nere höger</SelectItem>
                      <SelectItem value="bottom-left">Nere vänster</SelectItem>
                      <SelectItem value="top-right">Uppe höger</SelectItem>
                      <SelectItem value="top-left">Uppe vänster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <p className="text-sm text-amber-800">
                      💡 <strong>Premium Service:</strong> Vi hjälper er med professionell 
                      varumärkesintegration, inklusive logotypplacering och färganpassning.
                      <span className="font-medium"> (+1.500 SEK)</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cost Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Kostnadsammanfattning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Avatar Setup (bas):</span>
              <span>2.500 SEK</span>
            </div>
            {selectedAttire !== 'business-suit' && selectedAttire !== 'business-casual' && (
              <div className="flex justify-between text-sm">
                <span>Speciell klädsel:</span>
                <span>{attireOptions.find(a => a.id === selectedAttire)?.price}</span>
              </div>
            )}
            {selectedBackground !== 'office-modern' && selectedBackground !== 'boardroom' && (
              <div className="flex justify-between text-sm">
                <span>Premium bakgrund:</span>
                <span>{backgroundOptions.find(b => b.id === selectedBackground)?.price}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-green-700">{calculateTotalCost().toLocaleString()} SEK</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Föregående
        </Button>
        
        <Button 
          onClick={handleFinishSetup}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          Slutför Avatar Setup
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export { AvatarCustomizationStep };
