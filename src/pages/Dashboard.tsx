
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, FileText, Video, TrendingUp, User, Star, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects?id=${projectId}`);
    toast({
      title: "Öppnar projekt",
      description: "Navigerar till projektvy...",
    });
  };

  const stats = [
    {
      title: "Totala Projekt",
      value: projects.length.toString(),
      description: "Aktiva AI-videoprojekt",
      icon: FileText,
    },
    {
      title: "Videos Genererade",
      value: "0",
      description: "Färdiga AI-videos",
      icon: Video,
    },
    {
      title: "Avatarer",
      value: "0",
      description: "Personliga AI-avatarer",
      icon: User,
    },
    {
      title: "Månadsaktivitet",
      value: "↗ 12%",
      description: "Ökning senaste månaden",
      icon: TrendingUp,
    },
  ];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Välkommen tillbaka, {user?.user_metadata?.first_name || 'Användare'}!
          </h1>
          <p className="text-slate-600 mt-2">
            Skapa din professionella AI-avatar och börja producera personliga videopresentationer.
          </p>
        </div>

        {/* Hero CTA for Avatar Creation */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 text-white flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Skapa Din Professionella Avatar
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Få din egen AI-avatar som presenterar era rapporter med din röst och personlighet
                </CardDescription>
              </div>
              <Zap className="h-16 w-16 text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-100">
                ✓ Professionell video-avatar ✓ Röstkloning ✓ Anpassad till ert varumärke
              </div>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <Link to="/avatars/create" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Skapa Avatar Nu
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Skapa Nytt Projekt
              </CardTitle>
              <CardDescription>
                Starta ett nytt AI-videoprojekt med våra mallar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/projects">
                    Nytt Projekt
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/templates">
                    Bläddra Mallar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <User className="h-5 w-5" />
                Din Professionella Avatar
              </CardTitle>
              <CardDescription className="text-blue-700">
                Skapa en personlig AI-avatar för era presentationer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/avatars/create">
                    Skapa Avatar
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Link to="/avatars">
                    Hantera Avatarer
                  </Link>
                </Button>
                <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  <strong>Setup:</strong> 2.500-5.000 SEK per avatar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Kom Igång
              </CardTitle>
              <CardDescription>
                Lär dig hur du skapar fantastiska AI-videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Följ vår snabbguide för att skapa din första AI-video på bara några minuter.
                </p>
                <Button variant="outline" className="w-full">
                  Se Handledning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Senaste Projekt</CardTitle>
                <CardDescription>
                  Dina nyligen skapade eller uppdaterade projekt
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/projects">Se Alla</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Inga projekt än
                </h3>
                <p className="text-slate-600 mb-4">
                  Skapa ditt första AI-videoprojekt för att komma igång.
                </p>
                <Button asChild>
                  <Link to="/projects">
                    Skapa Projekt
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-slate-900">{project.name}</h4>
                      <p className="text-sm text-slate-600">{project.description || "Ingen beskrivning"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Uppdaterad {new Date(project.updated_at).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      Öppna
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
