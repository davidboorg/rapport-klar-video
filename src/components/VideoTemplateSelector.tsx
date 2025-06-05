
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check } from "lucide-react";

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

const templates: VideoTemplate[] = [
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

interface VideoTemplateSelectorProps {
  selectedTemplate: string | null;
  onTemplateSelect: (template: VideoTemplate) => void;
}

const VideoTemplateSelector = ({ selectedTemplate, onTemplateSelect }: VideoTemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Välj videomall</h3>
        <p className="text-sm text-slate-600">Välj en stil som passar ditt företags image</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Preview */}
              <div className="relative bg-gradient-to-br rounded-lg p-4 text-center overflow-hidden"
                   style={{ 
                     background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})` 
                   }}>
                <Play className="w-8 h-8 text-white mx-auto opacity-80" />
                <p className="text-xs text-white mt-1">Förhandsgranska</p>
              </div>

              {/* Color Palette */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Färgpalett:</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded-full border" 
                       style={{ backgroundColor: template.colors.primary }} />
                  <div className="w-4 h-4 rounded-full border" 
                       style={{ backgroundColor: template.colors.secondary }} />
                  <div className="w-4 h-4 rounded-full border" 
                       style={{ backgroundColor: template.colors.accent }} />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1">
                <span className="text-xs font-medium">Funktioner:</span>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoTemplateSelector;
