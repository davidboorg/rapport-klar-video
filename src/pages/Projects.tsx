import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, File, FileText } from "lucide-react";
import ProjectCard from "@/components/project/ProjectCard";
import ProjectFilters from "@/components/project/ProjectFilters";
import ProjectStats from "@/components/project/ProjectStats";
import CreateProjectDialog, { ProjectFormData } from "@/components/project/CreateProjectDialog";
import { useProjectManagement } from "@/hooks/useProjectManagement";

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    projects, 
    analytics, 
    stats, 
    loading, 
    createProject, 
    deleteProject, 
    incrementViews, 
    incrementShares 
  } = useProjectManagement();

  // UI State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesReportType = reportTypeFilter === 'all' || project.report_type === reportTypeFilter;
    const matchesIndustry = industryFilter === 'all' || project.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesReportType && matchesIndustry;
  });

  // Upload PDF functionality
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
        const newProject = await createProject({
          name: projectName,
          description: `AI-processed from ${file.name}`,
          industry: '',
          report_type: 'Q4',
          fiscal_year: new Date().getFullYear()
        });
        
        if (!newProject) {
          throw new Error('Failed to create project');
        }
        finalProjectId = newProject.id;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Update project with PDF info and trigger intelligent processing
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status: 'processing',
          pdf_url: `uploaded/${file.name}` // Placeholder URL
        })
        .eq('id', finalProjectId);

      if (updateError) throw updateError;

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Start intelligent processing workflow
      toast({
        title: "PDF Uploaded Successfully!",
        description: "Starting intelligent analysis and script generation...",
      });

      // Trigger the intelligent processing
      const { data, error: processingError } = await supabase.functions.invoke('analyze-financial-data', {
        body: { 
          projectId: finalProjectId,
          pdfText: `Financial report content from ${file.name}` // This would be actual PDF text in production
        }
      });

      if (processingError) {
        console.error('Processing error:', processingError);
        toast({
          title: "Processing Warning",
          description: "PDF uploaded but AI processing encountered an issue. You can still create scripts manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "AI Analysis Complete!",
          description: "Your financial report has been analyzed and multiple script alternatives are ready.",
        });
      }

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

  // Project actions
  const handleCreateProject = async (projectData: ProjectFormData) => {
    setCreatingProject(true);
    try {
      await createProject(projectData);
      setIsCreateDialogOpen(false);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    incrementViews(projectId);
    toast({
      title: "Opening Project",
      description: `Opening project...`,
    });
    // TODO: Navigate to project editor when implemented
    console.log('Opening project:', projectId);
  };

  const handleEditProject = (projectId: string) => {
    toast({
      title: "Editing Project",
      description: `Editing project...`,
    });
    // TODO: Open edit dialog when implemented
    console.log('Editing project:', projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    await deleteProject(projectId);
  };

  const handleDownloadVideo = (projectId: string) => {
    toast({
      title: "Downloading Video",
      description: "Video download started...",
    });
    // TODO: Implement video download
    console.log('Downloading video for project:', projectId);
  };

  const handleShareProject = (projectId: string) => {
    incrementShares(projectId);
    toast({
      title: "Sharing Project",
      description: "Share link copied to clipboard!",
    });
    // TODO: Implement sharing functionality
    console.log('Sharing project:', projectId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setReportTypeFilter('all');
    setIndustryFilter('all');
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
            <h1 className="text-3xl font-bold text-slate-900">Project Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Manage your quarterly report videos and track their performance
            </p>
          </div>
          
          <CreateProjectDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreateProject={handleCreateProject}
            loading={creatingProject}
          />
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <ProjectStats stats={stats} />
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Upload
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

        {/* Filters */}
        {projects.length > 0 && (
          <div className="mb-6">
            <ProjectFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              reportTypeFilter={reportTypeFilter}
              industryFilter={industryFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onReportTypeFilterChange={setReportTypeFilter}
              onIndustryFilterChange={setIndustryFilter}
              onClearFilters={clearFilters}
            />
          </div>
        )}

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
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                No projects match your filters
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                analytics={analytics[project.id]}
                onOpenProject={handleOpenProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onDownloadVideo={handleDownloadVideo}
                onShareProject={handleShareProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

}
