
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, FileText, Video, TrendingUp, User, Star, Zap, Upload, CheckCircle, Home, Settings, HelpCircle } from "lucide-react";
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
      title: "Opening project",
      description: "Navigating to project view...",
    });
  };

  const stats = [
    {
      title: "Total Projects",
      value: projects.length.toString(),
      description: "Active video projects",
      icon: FileText,
    },
    {
      title: "Videos Generated",
      value: "0",
      description: "Completed presentations",
      icon: Video,
    },
    {
      title: "Avatars",
      value: "0",
      description: "Personal presenters",
      icon: User,
    },
    {
      title: "Monthly Activity",
      value: "↗ 12%",
      description: "Growth this month",
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
        {/* New Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Transform Quarterly Reports into Professional Videos
          </h1>
          
          {/* Feature Checkmarks */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Upload your financial report</span>
            </div>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">AI generates professional script</span>
            </div>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Your personal avatar presents</span>
            </div>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Share engaging video content</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4" asChild>
              <Link to="/projects" className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Report
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo Video
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid gap-6 mb-8 md:grid-cols-3 lg:grid-cols-6">
          <Link to="/dashboard">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Home className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Dashboard</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/projects">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">My Report Videos</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/projects">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">Create New Video</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/avatars">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium">Avatar Library</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="font-medium">Settings</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="font-medium">Help & Support</p>
            </CardContent>
          </Card>
        </div>

        {/* User Journey Steps */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-900">Your Video Creation Journey</CardTitle>
            <CardDescription className="text-center text-blue-700">
              From quarterly report to professional video presentation in 5 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Upload Report</h3>
                <p className="text-sm text-slate-600">PDF processing</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Review Script</h3>
                <p className="text-sm text-slate-600">AI-generated content</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Select Avatar</h3>
                <p className="text-sm text-slate-600">Presenter choice</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Generate Video</h3>
                <p className="text-sm text-slate-600">HeyGen + ElevenLabs</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="font-semibold mb-2">Download & Share</h3>
                <p className="text-sm text-slate-600">Final output</p>
              </div>
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

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Report Videos</CardTitle>
                <CardDescription>
                  Your recently created or updated video projects
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/projects">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No report videos yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Upload your first quarterly report to create a professional video presentation.
                </p>
                <Button asChild>
                  <Link to="/projects">
                    Upload Report
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
                      <p className="text-sm text-slate-600">{project.description || "No description"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Updated {new Date(project.updated_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      Open
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
