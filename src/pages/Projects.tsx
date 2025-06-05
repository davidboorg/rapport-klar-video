import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import ScriptEditor from "@/components/ScriptEditor";
import FinancialDataDisplay from "@/components/FinancialDataDisplay";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Video, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Edit, 
  Trash2,
  Play,
  Calendar,
  Clock,
  Wand2,
  Brain
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: "uploading" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  pdf_url?: string;
  financial_data?: any;
}

interface GeneratedContent {
  id: string;
  project_id: string;
  script_text: string;
  generation_status: string;
  created_at: string;
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isScriptEditorOpen, setScriptEditorOpen] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      return data as Project[];
    },
    enabled: !!user,
  });

  const { data: generatedContent = [] } = useQuery({
    queryKey: ['generated_content', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching generated content:', error);
        return [];
      }
      
      return data as GeneratedContent[];
    },
    enabled: !!user,
  });

  const handleAnalyzeFinancialData = async (project: Project) => {
    if (!project.pdf_url) {
      toast({
        title: "Fel",
        description: "Ingen PDF-fil finns för detta projekt.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(project.id);
    try {
      // Here we would normally extract text from the PDF
      // For now, we'll simulate with sample text
      const samplePdfText = `
        Quarterly Report Q3 2024
        Company: TechCorp AB
        Revenue: 125.5 MSEK (+15%)
        EBITDA: 32.1 MSEK (+22%)
        Growth: 15% YoY
        Key highlights: Strong digital transformation, new product launches, increased market share
      `;

      const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          pdfText: samplePdfText,
          projectId: project.id 
        }
      });

      if (error) throw error;

      toast({
        title: "Analys klar!",
        description: "Finansiell data har extraherats och videomanus har genererats.",
      });

      refetch();
    } catch (error) {
      console.error('Error analyzing financial data:', error);
      toast({
        title: "Fel",
        description: "Kunde inte analysera finansiell data. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const openScriptEditor = (project: Project) => {
    setSelectedProject(project);
    setScriptEditorOpen(true);
  };

  const getProjectScript = (projectId: string) => {
    return generatedContent.find(content => content.project_id === projectId)?.script_text || "";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Klar</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-700">Bearbetas</Badge>;
      case "uploading":
        return <Badge className="bg-blue-100 text-blue-700">Laddas upp</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Misslyckades</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || project.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Logga in för att se dina projekt
            </h3>
            <p className="text-slate-500">
              Du behöver vara inloggad för att komma åt dina finansiella rapporter
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
            <p className="text-slate-500 mt-4">Laddar projekt...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Projekt</h1>
          <p className="text-slate-600 mt-2">
            Hantera och organisera dina finansiella rapporter och videor
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Sök projekt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Datum
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Alla ({projects.length})</TabsTrigger>
            <TabsTrigger value="completed">
              Klara ({projects.filter(p => p.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Bearbetas ({projects.filter(p => p.status === "processing").length})
            </TabsTrigger>
            <TabsTrigger value="uploading">
              Laddas upp ({projects.filter(p => p.status === "uploading").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {project.status === "completed" ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{project.name}</CardTitle>
                      <p className="text-sm text-slate-500">Finansiell rapport</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {project.pdf_url && !project.financial_data && (
                        <DropdownMenuItem onClick={() => handleAnalyzeFinancialData(project)}>
                          <Brain className="mr-2 h-4 w-4" />
                          Analysera finansiell data
                        </DropdownMenuItem>
                      )}
                      {project.financial_data && (
                        <DropdownMenuItem onClick={() => openScriptEditor(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Redigera manus
                        </DropdownMenuItem>
                      )}
                      {project.status === "completed" && (
                        <>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Förhandsgranska
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Ladda ner
                          </DropdownDropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Ta bort
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-slate-500">
                      {project.financial_data ? "AI-analyserad" : project.pdf_url ? "PDF uppladdad" : "Ingen PDF"}
                    </span>
                  </div>

                  {/* Financial Data Summary */}
                  {project.financial_data && (
                    <div className="text-xs bg-green-50 p-2 rounded">
                      <div className="font-medium text-green-800">Finansiell data:</div>
                      <div className="text-green-700">
                        {project.financial_data.company_name && (
                          <div>{project.financial_data.company_name}</div>
                        )}
                        {project.financial_data.revenue && (
                          <div>Intäkter: {project.financial_data.revenue}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Created date */}
                  <div className="text-xs text-slate-500">
                    Skapad: {new Date(project.created_at).toLocaleDateString('sv-SE')}
                    {project.updated_at !== project.created_at && (
                      <span> • Uppdaterad: {new Date(project.updated_at).toLocaleDateString('sv-SE')}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    {project.financial_data ? (
                      <Button size="sm" onClick={() => openScriptEditor(project)} className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Redigera manus
                      </Button>
                    ) : project.pdf_url ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleAnalyzeFinancialData(project)}
                        disabled={isAnalyzing === project.id}
                        className="flex-1"
                      >
                        {isAnalyzing === project.id ? (
                          <>
                            <Wand2 className="w-3 h-3 mr-1 animate-spin" />
                            Analyserar...
                          </>
                        ) : (
                          <>
                            <Brain className="w-3 h-3 mr-1" />
                            Analysera med AI
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Fortsätt redigera
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? "Inga projekt hittades" : "Inga projekt ännu"}
            </h3>
            <p className="text-slate-500">
              {searchTerm ? "Försök med ett annat sökord" : "Ladda upp din första rapport för att komma igång"}
            </p>
          </div>
        )}
      </div>

      {/* Script Editor Dialog */}
      <Dialog open={isScriptEditorOpen} onOpenChange={setScriptEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Videomanus - {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedProject?.financial_data && (
              <FinancialDataDisplay data={selectedProject.financial_data} />
            )}
            {selectedProject && (
              <ScriptEditor
                projectId={selectedProject.id}
                initialScript={getProjectScript(selectedProject.id)}
                onScriptUpdate={() => {
                  // Refresh data after script update
                  refetch();
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
