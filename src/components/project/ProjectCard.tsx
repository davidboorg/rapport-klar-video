
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Building2, 
  Download, 
  Share2, 
  Eye, 
  Settings,
  Play,
  FileText,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: {
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
  };
  analytics?: {
    views: number;
    shares: number;
    completion_rate?: number;
  };
  onOpenProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDownloadVideo: (projectId: string) => void;
  onShareProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  analytics,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onDownloadVideo,
  onShareProject
}) => {
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
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'uploading':
        return 'Uploading';
      default:
        return 'Unknown';
    }
  };

  const formatReportPeriod = () => {
    if (project.report_type && project.fiscal_year) {
      return `${project.report_type} ${project.fiscal_year}`;
    }
    return 'Report Period';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {project.company_logo_url ? (
                <img 
                  src={project.company_logo_url} 
                  alt="Company logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {formatReportPeriod()}
                </Badge>
                {project.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {project.industry}
                  </Badge>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditProject(project.id)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShareProject(project.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {project.status === 'completed' && (
                <DropdownMenuItem onClick={() => onDownloadVideo(project.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteProject(project.id)}
                className="text-red-600"
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Progress */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
          {project.pdf_url && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <FileText className="h-3 w-3" />
              PDF Uploaded
            </div>
          )}
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {analytics.views} views
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                {analytics.shares} shares
              </div>
            </div>
            {analytics.completion_rate && (
              <div className="text-xs">
                {analytics.completion_rate}% completion
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div>
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1"
            onClick={() => onOpenProject(project.id)}
          >
            {project.status === 'completed' ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                View Video
              </>
            ) : (
              'Continue'
            )}
          </Button>
          {project.status === 'completed' && (
            <Button 
              variant="outline"
              onClick={() => onDownloadVideo(project.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
