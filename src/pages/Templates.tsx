
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Play, Star, Clock, Users, Palette, TrendingUp, Shield, Briefcase } from "lucide-react";

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      name: "Konservativ Business",
      description: "Klassisk och professionell stil för traditionella företag",
      category: "conservative",
      features: ["Ren design", "Klassiska färger", "Formell ton"],
      duration: "2-3 min",
      popularity: 95,
      thumbnail: "/placeholder.svg",
      colors: ["#1e40af", "#374151", "#f8fafc"],
      icon: Briefcase,
    },
    {
      id: 2,
      name: "Modern Tech",
      description: "Innovativ och dynamisk design för teknikföretag",
      category: "modern",
      features: ["Animationer", "Moderna grafer", "Teknisk känsla"],
      duration: "2-4 min",
      popularity: 88,
      thumbnail: "/placeholder.svg",
      colors: ["#06b6d4", "#6366f1", "#f1f5f9"],
      icon: TrendingUp,
    },
    {
      id: 3,
      name: "Minimalistisk",
      description: "Ren och enkel design som fokuserar på innehållet",
      category: "modern",
      features: ["Minimal design", "Fokus på data", "Elegant typografi"],
      duration: "2-3 min",
      popularity: 92,
      thumbnail: "/placeholder.svg", 
      colors: ["#0f172a", "#64748b", "#ffffff"],
      icon: Palette,
    },
    {
      id: 4,
      name: "Finansiell Expert",
      description: "Specialanpassad för finansbranschen med branschspecifika element",
      category: "conservative",
      features: ["Finansiella ikoner", "Grafer & diagram", "Professionell ton"],
      duration: "3-4 min",
      popularity: 90,
      thumbnail: "/placeholder.svg",
      colors: ["#059669", "#374151", "#f0fdf4"],
      icon: Shield,
    },
    {
      id: 5,
      name: "Startup Dynamic",
      description: "Energisk och modern stil för startups och tillväxtföretag",
      category: "modern",
      features: ["Dynamiska övergångar", "Livfulla färger", "Ungdomlig känsla"],
      duration: "2-3 min",
      popularity: 85,
      thumbnail: "/placeholder.svg",
      colors: ["#f59e0b", "#ef4444", "#fef3c7"],
      icon: TrendingUp,
    },
    {
      id: 6,
      name: "Nordisk Design",
      description: "Skandinavisk elegans med naturinspirerade element",
      category: "conservative",
      features: ["Nordiska färger", "Naturinspiration", "Hållbar känsla"],
      duration: "3-4 min",
      popularity: 87,
      thumbnail: "/placeholder.svg",
      colors: ["#0ea5e9", "#10b981", "#f8fafc"],
      icon: Users,
    },
  ];

  const categories = [
    { id: "all", label: "Alla mallar", count: templates.length },
    { id: "conservative", label: "Konservativ", count: templates.filter(t => t.category === "conservative").length },
    { id: "modern", label: "Modern", count: templates.filter(t => t.category === "modern").length },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

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

        {/* Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-sm">
                {category.label} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
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
                      <template.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-600 ml-1">{template.popularity}%</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.category === "conservative" ? "Konservativ" : "Modern"}
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
                         style={{ background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` }}>
                    </div>
                    <Play className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Förhandsgranska mall</p>
                  </div>

                  {/* Color Palette */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Färgpalett:</span>
                    <div className="flex space-x-1">
                      {template.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600">{template.description}</p>

                  {/* Features */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Funktioner:</span>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {template.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {template.popularity}% popularitet
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
          ))}
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
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Inga mallar hittades
            </h3>
            <p className="text-slate-500">
              Försök med en annan kategori eller kom tillbaka senare för fler mallar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
