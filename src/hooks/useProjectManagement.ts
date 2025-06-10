
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
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
    usageLimit: 10, // Default limit
    usageUsed: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch projects with analytics
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch analytics for all projects
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('project_analytics')
        .select('*');

      if (analyticsError) throw analyticsError;

      // Organize analytics by project_id
      const analyticsMap = analyticsData?.reduce((acc, item) => {
        acc[item.project_id] = item;
        return acc;
      }, {} as Record<string, ProjectAnalytics>) || {};

      setProjects(projectsData || []);
      setAnalytics(analyticsMap);

      // Calculate stats
      calculateStats(projectsData || [], analyticsData || []);

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

  // Calculate project statistics
  const calculateStats = (projectsData: Project[], analyticsData: ProjectAnalytics[]) => {
    const total = projectsData.length;
    const completed = projectsData.filter(p => p.status === 'completed').length;
    const processing = projectsData.filter(p => p.status === 'processing').length;
    const failed = projectsData.filter(p => p.status === 'failed').length;
    
    const totalViews = analyticsData.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalShares = analyticsData.reduce((sum, item) => sum + (item.shares || 0), 0);

    // Calculate usage for current month
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
      usageLimit: 10, // This could come from user subscription
      usageUsed
    });
  };

  // Create new project
  const createProject = async (projectData: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          status: 'uploading'
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial analytics record
      await supabase
        .from('project_analytics')
        .insert({
          project_id: data.id,
          views: 0,
          shares: 0
        });

      toast({
        title: "Project Created!",
        description: "Your new project has been created successfully.",
      });

      fetchProjects(); // Refresh the list
      return data;
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

  // Delete project
  const deleteProject = async (projectId: string) => {
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

      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Could not delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update project analytics
  const incrementViews = async (projectId: string) => {
    try {
      const { error } = await supabase.rpc('increment_project_views', {
        project_id: projectId
      });

      if (error) throw error;
      fetchProjects(); // Refresh analytics
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const incrementShares = async (projectId: string) => {
    try {
      const { error } = await supabase.rpc('increment_project_shares', {
        project_id: projectId
      });

      if (error) throw error;
      fetchProjects(); // Refresh analytics
    } catch (error) {
      console.error('Error incrementing shares:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchProjects();

    // Subscribe to project changes
    const projectsSubscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
    };
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
