
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, FileText, Video, TrendingUp, User, Star, Zap, Upload } from "lucide-react";
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
      description: "Active AI video projects",
      icon: FileText,
    },
    {
      title: "Videos Generated",
      value: "0",
      description: "Completed AI videos",
      icon: Video,
    },
    {
      title: "Avatars",
      value: "0",
      description: "Personal AI avatars",
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.user_metadata?.first_name || 'User'}!
          </h1>
          <p className="text-slate-600 mt-2">
            Transform your quarterly reports into professional video presentations with AI.
          </p>
        </div>

        {/* Hero CTA for Report Upload */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 text-white flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Transform Your Quarterly Reports into Professional Videos
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Upload your report and let AI create engaging video presentations with your personal avatar
                </CardDescription>
              </div>
              <Zap className="h-16 w-16 text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-100">
                ✓ AI Script Generation ✓ Personal Avatar Creation ✓ HD Video Output
              </div>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <Link to="/projects" className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Quarterly Report
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
                Create New Video
              </CardTitle>
              <CardDescription>
                Start a new AI video project from your quarterly report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/projects">
                    Upload Report
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/templates">
                    Browse Templates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <User className="h-5 w-5" />
                Your Professional Avatar
              </CardTitle>
              <CardDescription className="text-blue-700">
                Create a personal AI avatar for your presentations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/avatars/create">
                    Create Avatar
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Link to="/avatars">
                    Manage Avatars
                  </Link>
                </Button>
                <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  <strong>Setup:</strong> $300-600 per avatar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Learn how to create amazing AI videos from reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Follow our quick guide to create your first AI video from a quarterly report in minutes.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Tutorial
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
                  Upload your first quarterly report to create an AI video presentation.
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
