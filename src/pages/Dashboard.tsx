
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { 
  FileText, 
  Play, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users,
  ArrowRight,
  Brain,
  Mic
} from 'lucide-react';
import QuickPodcastTest from '@/components/dev/QuickPodcastTest';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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

  const stats = [
    { label: "Documents Processed", value: "12", icon: <FileText className="w-6 h-6" />, color: "text-blue-400" },
    { label: "Podcasts Created", value: "15", icon: <Mic className="w-6 h-6" />, color: "text-green-400" },
    { label: "Hours Saved", value: "24", icon: <Clock className="w-6 h-6" />, color: "text-yellow-400" },
    { label: "Avg Growth", value: "+12%", icon: <TrendingUp className="w-6 h-6" />, color: "text-purple-400" },
  ];

  const quickActions = [
    {
      title: "Upload New Document",
      description: "Start with a PDF or Word document",
      icon: <Upload className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      href: "/workflow"
    },
    {
      title: "View Projects",
      description: "Manage your existing projects",
      icon: <FileText className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      href: "/projects"
    },
    {
      title: "Create Avatar",
      description: "Generate a custom AI avatar",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      href: "/avatars/create"
    }
  ];

  const recentActivity = [
    { type: "document", title: "Q4 Financial Report", status: "completed", time: "2 hours ago" },
    { type: "podcast", title: "Investor Update", status: "completed", time: "3 days ago" },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to ReportFlow
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Transform your financial documents into professional podcasts with AI-powered automation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ModernCard key={index} className="p-6 text-center">
              <div className={`${stat.color} mb-4 flex justify-center`}>
                {stat.icon}
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <ModernCard className="p-6 text-center group cursor-pointer h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-300 mb-4">{action.description}</p>
                  <ModernButton variant="glass" size="sm" className="w-full group-hover:bg-white/20 transition-colors">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </ModernButton>
                </ModernCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          
          <ModernCard className="p-6">
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                      {item.type === 'document' && <FileText className="w-5 h-5 text-blue-400" />}
                      {item.type === 'podcast' && <Mic className="w-5 h-5 text-green-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-slate-400">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                    <ModernButton variant="glass" size="sm">
                      <Play className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>

        {/* Getting Started */}
        <ModernCard variant="gradient" className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-slate-200 mb-6">
                Upload your first document and let AI transform it into professional content in minutes.
              </p>
            </div>
            <Link to="/workflow">
              <ModernButton size="lg" className="group">
                <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Your First Project
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </ModernButton>
            </Link>
          </div>
        </ModernCard>
        <QuickPodcastTest />
      </div>
    </div>
  );
};

export default Dashboard;
