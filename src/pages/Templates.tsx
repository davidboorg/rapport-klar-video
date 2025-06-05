
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Play, Star, Clock, Users, Palette, TrendingUp, Shield, Briefcase } from "lucide-react";

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

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
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
          <h1 className="text-3xl font-bold text-slate-900">Videomallar</h1>
          <p className="text-slate-600 mt-2">
            Välj en professionell mall som passar ditt företags stil och image
          </p>
        </div>

        {/* Templates Grid */}
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
                    {/* Preview Area */}
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-6 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-10" 
                           style={{ 
                             background: `linear-gradient(135deg, ${template.style_config.colors[0]}, ${template.style_config.colors[1] || template.style_config.colors[0]})` 
                           }}>
                      </div>
                      <Play className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Förhandsgranska mall</p>
                    </div>

                    {/* Color Palette */}
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

                    {/* Features */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Funktioner:</span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.style_config.font} typsnitt
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.style_config.animation_style} animationer
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getThemeLabel(template.style_config.theme)} design
                        </Badge>
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

        {/* Selected Template Action */}
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
                  <p className="text-sm text-slate-600">Mall vald</p>
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
        {templates.length === 0 && !isLoading && (
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
