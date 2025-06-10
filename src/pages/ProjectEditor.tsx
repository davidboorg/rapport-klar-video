
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ScriptEditor from "@/components/ScriptEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Video, Calendar, Building2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  company_logo_url?: string;
  industry?: string;
  report_type?: string;
  fiscal_year?: number;
  status: string;
  created_at: string;
  updated_at: string;
  pdf_url?: string;
  financial_data?: any;
}

const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId && user) {
      fetchProject();
    }
  }, [projectId, user]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda projektet. Försök igen.",
        variant: "destructive",
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Slutförd';
      case 'processing':
        return 'Bearbetar';
      case 'failed':
        return 'Misslyckades';
      case 'uploading':
        return 'Laddar upp';
      default:
        return 'Okänd';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-medium mb-2">Projekt hittades inte</h3>
              <p className="text-slate-600 mb-4">
                Projektet du försöker öppna existerar inte eller så har du inte tillgång till det.
              </p>
              <Button onClick={() => navigate('/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till projekt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
          
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {project.company_logo_url ? (
                <img 
                  src={project.company_logo_url} 
                  alt="Company logo" 
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Project Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-slate-600 mb-4">{project.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {project.report_type && project.fiscal_year && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {project.report_type} {project.fiscal_year}
                  </div>
                )}
                {project.industry && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {project.industry}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Skapad {new Date(project.created_at).toLocaleDateString('sv-SE')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {project.status === 'processing' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="font-medium text-blue-900">Bearbetar rapport</h3>
                    <p className="text-sm text-blue-700">
                      AI:n analyserar din finansiella rapport och genererar script-alternativ. Detta kan ta några minuter.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {project.status === 'failed' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div>
                  <h3 className="font-medium text-red-900 mb-2">Bearbetning misslyckades</h3>
                  <p className="text-sm text-red-700">
                    Det uppstod ett problem när rapporten bearbetades. Du kan fortfarande skapa script manuellt.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Script Editor */}
          <ScriptEditor
            projectId={project.id}
            onScriptUpdate={(script) => {
              console.log('Script updated:', script);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
