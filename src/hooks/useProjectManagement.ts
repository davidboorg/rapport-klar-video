
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  user_id: string;
}

interface ProjectAnalytics {
  project_id: string;
  views: number;
  shares: number;
  completion_rate?: number;
}

interface ProjectStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalViews: number;
  totalShares: number;
  usageLimit: number;
  usageUsed: number;
}

export const useProjectManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, ProjectAnalytics>>({});
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    totalViews: 0,
    totalShares: 0,
    usageLimit: 10,
    usageUsed: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for now since we're using Berget.ai
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock projects data
      const mockProjects: Project[] = [];
      const mockAnalytics: ProjectAnalytics[] = [];
      
      setProjects(mockProjects);
      setAnalytics({});
      calculateStats(mockProjects, mockAnalytics);
      
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

  const calculateStats = (projectsData: Project[], analyticsData: ProjectAnalytics[]) => {
    const total = projectsData.length;
    const completed = projectsData.filter(p => p.status === 'completed').length;
    const processing = projectsData.filter(p => p.status === 'processing').length;
    const failed = projectsData.filter(p => p.status === 'failed').length;
    
    const totalViews = analyticsData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalShares = analyticsData.reduce((sum, item) => sum + (item.shares || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const usageUsed = projectsData.filter(p => {
      const projectDate = new Date(p.created_at);
      return projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
    }).length;

    setStats({
      total,
      completed,
      processing,
      failed,
      totalViews,
      totalShares,
      usageLimit: 10,
      usageUsed
    });
  };

  const createProject = async (projectData: any) => {
    if (!user) return null;

    try {
      // Mock project creation
      const newProject: Project = {
        id: `project_${Date.now()}`,
        ...projectData,
        user_id: user.id,
        status: 'uploading',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      toast({
        title: "Project Created!",
        description: "Your new project has been created successfully.",
      });

      fetchProjects();
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Could not create project. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
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

  const incrementViews = async (projectId: string) => {
    try {
      fetchProjects();
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const incrementShares = async (projectId: string) => {
    try {
      fetchProjects();
    } catch (error) {
      console.error('Error incrementing shares:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    analytics,
    stats,
    loading,
    createProject,
    deleteProject,
    incrementViews,
    incrementShares,
    fetchProjects
  };
};
