
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload,
  FolderOpen,
  Play,
  Settings,
  Sparkles,
  TrendingUp,
  BarChart3,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  PlusCircle,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userName = user.email?.split('@')[0] || 'User';

  const quickActions = [
    {
      title: "Upload Report",
      description: "Transform your financial report into video",
      icon: <Upload className="w-8 h-8" />,
      color: "from-blue-500 to-purple-600",
      href: "/projects",
      primary: true
    },
    {
      title: "My Projects",
      description: "View and manage your projects",
      icon: <FolderOpen className="w-6 h-6" />,
      color: "from-green-500 to-teal-600",
      href: "/projects"
    },
    {
      title: "Create Avatar",
      description: "Set up AI avatars for videos",
      icon: <Users className="w-6 h-6" />,
      color: "from-pink-500 to-rose-600",
      href: "/avatars"
    },
    {
      title: "Settings",
      description: "Customize your account",
      icon: <Settings className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-600",
      href: "/profile"
    }
  ];

  const stats = [
    { label: "Total Projects", value: "0", icon: <FileText className="w-5 h-5" />, change: "+0%" },
    { label: "Videos Created", value: "0", icon: <Play className="w-5 h-5" />, change: "+0%" },
    { label: "Storage Used", value: "0 MB", icon: <BarChart3 className="w-5 h-5" />, change: "of 1 GB" },
    { label: "This Month", value: "0", icon: <TrendingUp className="w-5 h-5" />, change: "reports processed" }
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome back, {userName}!
              </span>
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Create professional videos from your financial reports with AI-powered automation. 
            Start your journey towards automated reporting today.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary CTA */}
          <ModernCard className="lg:col-span-2 p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/10 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Start Your First Project</h3>
                    <p className="text-slate-200">Upload a report and let AI create magic</p>
                  </div>
                </div>
                <Link to="/projects">
                  <ModernButton size="lg" className="group">
                    <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Upload Report
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </ModernButton>
                </Link>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-3xl animate-pulse"></div>
              </div>
            </div>
          </ModernCard>

          {/* Secondary Action */}
          <ModernCard className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
            <p className="text-sm text-slate-300 mb-4">Get started with our templates</p>
            <ModernButton variant="glass" size="sm" className="w-full">
              Explore Templates
            </ModernButton>
          </ModernCard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ModernCard key={index} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-400">
                  {stat.icon}
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                  Ready
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.change}</p>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.slice(1).map((action, index) => (
            <Link key={index} to={action.href}>
              <ModernCard className="p-6 text-center h-full group">
                <div className={`w-14 h-14 bg-gradient-to-r ${action.color} bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-sm text-slate-300 mb-4">{action.description}</p>
                <ModernButton variant="glass" size="sm" className="w-full">
                  {action.title === "My Projects" ? "View All" : "Get Started"}
                </ModernButton>
              </ModernCard>
            </Link>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <ModernCard className="p-6">
            <ModernCardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <ModernCardTitle className="text-xl">Recent Projects</ModernCardTitle>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">New</Badge>
              </div>
            </ModernCardHeader>
            <ModernCardContent className="p-0">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-slate-300 mb-6 max-w-sm mx-auto">
                  Upload your first financial report to get started with AI-driven video generation.
                </p>
                <Link to="/projects">
                  <ModernButton>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create First Project
                  </ModernButton>
                </Link>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Account Overview */}
          <ModernCard className="p-6">
            <ModernCardHeader className="p-0 pb-4">
              <div className="flex items-center space-x-2">
                <ModernCardTitle className="text-xl">Account Overview</ModernCardTitle>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </ModernCardHeader>
            <ModernCardContent className="p-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-sm font-medium text-slate-300">Email</span>
                  <span className="text-sm text-white font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-sm font-medium text-slate-300">Plan</span>
                  <Badge className="bg-yellow-500/20 text-yellow-300">Free Trial</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-sm font-medium text-slate-300">Tier</span>
                  <span className="text-sm text-white font-medium">Starter</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-300">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
              <Link to="/profile">
                <ModernButton variant="glass" className="w-full">
                  Manage Account
                </ModernButton>
              </Link>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
