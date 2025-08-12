
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search,
  Filter,
  Plus,
  Calendar,
  MoreVertical,
  Play,
  Download,
  Trash2,
  Upload,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';

const Projects = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-200">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const projectTemplates = [
    {
      name: "Quarterly Report Template",
      description: "Perfect for Q1-Q4 financial summaries",
      icon: <FileText className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Board Meeting Summary",
      description: "Executive briefings and decisions",
      icon: <Play className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Annual Report Podcast",
      description: "Comprehensive yearly overview",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Projects
            </h1>
            <p className="text-lg text-slate-300">
              Manage your audio projects and templates.
            </p>
          </div>
          <ModernButton className="group">
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            New Project
          </ModernButton>
        </div>

        {/* Search and Filters */}
        <ModernCard className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            <ModernButton variant="glass" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </ModernButton>
          </div>
        </ModernCard>

        {/* Quick Start Templates */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Quick Start Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectTemplates.map((template, index) => (
              <ModernCard key={index} className="p-6 text-center group cursor-pointer">
                <div className={`w-16 h-16 bg-gradient-to-r ${template.color} bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-slate-300 mb-4">{template.description}</p>
                <ModernButton variant="glass" size="sm" className="w-full">
                  Use Template
                </ModernButton>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
          
          {/* Empty State */}
          <ModernCard className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No Projects Yet</h3>
                <p className="text-slate-300 leading-relaxed">
                  Create your first project to start generating professional podcasts from your financial reports. 
                  Choose from our templates or start from scratch.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ModernButton className="group">
                  <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Upload Report
                </ModernButton>
                <ModernButton variant="glass">
                  Browse Templates
                </ModernButton>
              </div>
            </div>
          </ModernCard>

          {/* Example project cards for future reference (commented out) */}
          {/* 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernCard className="group">
              <ModernCardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <ModernCardTitle className="text-lg">Q4 2023 Financial Report</ModernCardTitle>
                      <p className="text-sm text-slate-400">TechCorp Inc.</p>
                    </div>
                  </div>
                  <ModernButton variant="glass" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </ModernButton>
                </div>
              </ModernCardHeader>
              <ModernCardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500/20 text-green-300">Completed</Badge>
                  <span className="text-sm text-slate-400">2 days ago</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Videos Generated</span>
                    <span className="font-medium text-white">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Last Modified</span>
                    <span className="font-medium text-white">Dec 15, 2023</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <ModernButton size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    View
                  </ModernButton>
                  <ModernButton variant="glass" size="sm">
                    <Download className="w-4 h-4" />
                  </ModernButton>
                  <ModernButton variant="glass" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </ModernButton>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default Projects;
