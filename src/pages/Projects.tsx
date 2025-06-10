
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, FileText, Calendar, Settings, Trash2, Upload, File } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  pdf_url?: string;
}

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at, status, pdf_url')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Could not fetch projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          description: newProject.description,
          user_id: user?.id,
          status: 'uploading'
        });

      if (error) throw error;

      toast({
        title: "Project Created!",
        description: "Your new project has been created successfully.",
      });

      setNewProject({ name: '', description: '' });
      setIsDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Could not create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const uploadPDF = async (file: File, projectId?: string) => {
    if (!file.type.includes('pdf')) {
      toast({
        title: "Error",
        description: "Only PDF files are supported",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "Error", 
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create project if not provided
      let finalProjectId = projectId;
      if (!finalProjectId) {
        const projectName = file.name.replace('.pdf', '');
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: projectName,
            description: `Uploaded from ${file.name}`,
            user_id: user?.id,
            status: 'processing'
          })
          .select()
          .single();

        if (projectError) throw projectError;
        finalProjectId = projectData.id;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to Supabase storage (when storage is set up)
      // For now, we'll simulate the upload and store file info
      
      // Update project with PDF info
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status: 'uploaded',
          pdf_url: `uploaded/${file.name}` // Placeholder URL
        })
        .eq('id', finalProjectId);

      if (updateError) throw updateError;

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Upload Successful!",
        description: "Your PDF has been uploaded and is ready for processing.",
      });

      fetchProjects();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadPDF(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleOpenProject = (project: Project) => {
    toast({
      title: "Opening Project",
      description: `Opening ${project.name}...`,
    });
    // TODO: Navigate to project editor when implemented
    console.log('Opening project:', project);
  };

  const handleEditProject = (project: Project) => {
    toast({
      title: "Editing Project",
      description: `Editing ${project.name}...`,
    });
    // TODO: Open edit dialog when implemented
    console.log('Editing project:', project);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });

      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Could not delete project. Please try again.",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Report Videos</h1>
            <p className="text-slate-600 mt-2">
              Upload quarterly reports and create AI-powered video presentations
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project for your quarterly report video
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Q4 2024 Financial Report"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createProject}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Quarterly Report
            </CardTitle>
            <CardDescription>
              Upload your PDF quarterly report to start creating a video presentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input {...getInputProps()} />
              <File className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop your PDF here...</p>
              ) : (
                <div>
                  <p className="text-slate-900 font-medium mb-2">
                    Drag & drop your quarterly report PDF here
                  </p>
                  <p className="text-slate-600 text-sm mb-4">
                    or click to browse your files
                  </p>
                  <Button variant="outline">
                    Choose PDF File
                  </Button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-4">
                Supports PDF files up to 50MB
              </p>
            </div>
            
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm text-slate-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                No report videos yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Upload your first quarterly report to create a professional video presentation with AI.
              </p>
              <Button 
                {...getRootProps()}
                className="flex items-center gap-2 mx-auto"
              >
                <input {...getInputProps()} />
                <Upload className="h-4 w-4" />
                Upload Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {project.description || "No description"}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'completed' ? 'Completed' :
                           project.status === 'processing' ? 'Processing' :
                           project.status === 'uploaded' ? 'Uploaded' :
                           'Draft'}
                        </span>
                        {project.pdf_url && (
                          <span className="text-xs text-green-600">📄 PDF Uploaded</span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(project.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleOpenProject(project)}
                    >
                      {project.status === 'completed' ? 'View Video' : 'Continue'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
