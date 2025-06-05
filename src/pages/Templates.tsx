import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Play, Star, Clock, Users, Palette, TrendingUp, Shield, Briefcase, Film, Wand2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  style_config: {
    theme: string;
    colors: string[];
    font: string;
    animation_style: string;
  };
  preview_image?: string;
  is_active: boolean;
  created_at: string;
}

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: 'nordic-professional' | 'tech-forward' | 'traditional-finance';
  preview_image: string;
  features: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const videoTemplates: VideoTemplate[] = [
  {
    id: 'nordic-professional',
    name: 'Nordic Professional',
    description: 'Ren, minimalistisk design som speglar skandinavisk elegans',
    style: 'nordic-professional',
    preview_image: 'photo-1649972904349-6e44c42644a7',
    features: ['Minimal design', 'Ljusa färger', 'Elegant typografi', 'Luftig layout'],
    colors: {
      primary: '#2563eb',
      secondary: '#f8fafc',
      accent: '#0ea5e9'
    }
  },
  {
    id: 'tech-forward',
    name: 'Tech Forward',
    description: 'Modern, dynamisk presentation för innovativa företag',
    style: 'tech-forward',
    preview_image: 'photo-1488590528505-98d2b5aba04b',
    features: ['Dynamiska animationer', 'Gradient färger', 'Modern UI', 'Interaktiva element'],
    colors: {
      primary: '#7c3aed',
      secondary: '#1e293b',
      accent: '#06b6d4'
    }
  },
  {
    id: 'traditional-finance',
    name: 'Traditional Finance',
    description: 'Konservativ, pålitlig stil för finansiella institutioner',
    style: 'traditional-finance',
    preview_image: 'photo-1486312338219-ce68d2c6f44d',
    features: ['Professionell känsla', 'Konservativa färger', 'Klassisk typografi', 'Pålitlig design'],
    colors: {
      primary: '#059669',
      secondary: '#f1f5f9',
      accent: '#dc2626'
    }
  }
];

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedVideoTemplate, setSelectedVideoTemplate] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      return data as Template[];
    },
  });

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "professional":
        return Briefcase;
      case "minimal":
        return Palette;
      case "nordic":
        return Shield;
      default:
        return TrendingUp;
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case "professional":
        return "Professionell";
      case "minimal":
        return "Minimalistisk";
      case "nordic":
        return "Nordisk";
      default:
        return "Modern";
    }
  };

  const getVideoThemeIcon = (style: string) => {
    switch (style) {
      case "nordic-professional":
        return Shield;
      case "tech-forward":
        return TrendingUp;
      case "traditional-finance":
        return Briefcase;
      default:
        return Film;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Logga in för att använda mallar
            </h3>
            <p className="text-slate-500">
              Du behöver vara inloggad för att välja och använda videomallar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-500 mt-4">Laddar mallar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mallar</h1>
          <p className="text-slate-600 mt-2">
            Välj professionella mallar som passar ditt företags stil och image
          </p>
        </div>

        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Video Mallar
            </TabsTrigger>
            <TabsTrigger value="presentation" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Presentation Mallar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video">
            {/* Video Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoTemplates.map((template) => {
                const IconComponent = getVideoThemeIcon(template.style);
                
                return (
                  <Card 
                    key={template.id} 
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      selectedVideoTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedVideoTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Preview Area */}
                        <div className="bg-gradient-to-br rounded-lg p-6 text-center relative overflow-hidden"
                             style={{ 
                               background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})` 
                             }}>
                          <div className="absolute inset-0 bg-white bg-opacity-10"></div>
                          <div className="relative">
                            <Film className="w-12 h-12 text-white mx-auto mb-2 opacity-80" />
                            <p className="text-sm text-white">AI Video Mall</p>
                          </div>
                        </div>

                        {/* Color Palette */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Färgpalett:</span>
                          <div className="flex space-x-1">
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                 style={{ backgroundColor: template.colors.primary }} />
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                 style={{ backgroundColor: template.colors.secondary }} />
                            <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                 style={{ backgroundColor: template.colors.accent }} />
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-slate-700">Funktioner:</span>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Förhandsgranska
                          </Button>
                          <Button 
                            size="sm" 
                            className={`flex-1 ${
                              selectedVideoTemplate === template.id 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {selectedVideoTemplate === template.id ? 'Vald' : 'Välj mall'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="presentation">
            {/* Original Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const IconComponent = getThemeIcon(template.style_config.theme);
                
                return (
                  <Card 
                    key={template.id} 
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getThemeLabel(template.style_config.theme)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-6 text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br opacity-10" 
                               style={{ 
                                 background: `linear-gradient(135deg, ${template.style_config.colors[0]}, ${template.style_config.colors[1] || template.style_config.colors[0]})` 
                               }}>
                          </div>
                          <Play className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Förhandsgranska mall</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Färgpalett:</span>
                          <div className="flex space-x-1">
                            {template.style_config.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-medium text-slate-700">Funktioner:</span>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.style_config.font} typsnitt
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.style_config.animation_style} animationer
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Förhandsgranska
                          </Button>
                          <Button 
                            size="sm" 
                            className={`flex-1 ${
                              selectedTemplate === template.id 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {selectedTemplate === template.id ? 'Vald' : 'Välj mall'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Template Action for Video Templates */}
        {selectedVideoTemplate && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {videoTemplates.find(t => t.id === selectedVideoTemplate)?.name}
                  </h3>
                  <p className="text-sm text-slate-600">AI Video Mall vald</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => setSelectedVideoTemplate(null)}>
                  Avbryt
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Använd för videogenerering
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Template Action for Presentation Templates */}
        {selectedTemplate && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </h3>
                  <p className="text-sm text-slate-600">Presentation mall vald</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Avbryt
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Använd denna mall
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {templates.length === 0 && videoTemplates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Inga mallar tillgängliga
            </h3>
            <p className="text-slate-500">
              Kom tillbaka senare för fler mallar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
