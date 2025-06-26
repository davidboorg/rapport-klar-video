
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Laddar din dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userName = user.email?.split('@')[0] || 'Användare';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Välkommen tillbaka, {userName}!
              </span>
            </h1>
          </div>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Skapa professionella videor från dina finansiella rapporter med AI-kraft. 
            Börja din resa mot automatiserad rapportering idag.
          </p>
        </div>

        {/* Quick Actions - Primary CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="col-span-full lg:col-span-2 bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Starta ditt första projekt</h3>
                      <p className="text-slate-200">Ladda upp en rapport och låt AI:n skapa magi</p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 group">
                    <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Ladda upp rapport
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto">
                <FolderOpen className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Mina Projekt</h3>
                <p className="text-sm text-slate-200 mb-4">Hantera dina befintliga projekt</p>
                <Button variant="outline" size="sm" className="w-full border-white/30 text-white hover:bg-white/10">
                  Visa alla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-pink-500/30 transition-colors">
                <Play className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Video Mallar</h3>
                <p className="text-sm text-slate-200 mb-4">Utforska professionella mallar</p>
                <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10">
                  Bläddra mallar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-green-500/30 transition-colors">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Avatarer</h3>
                <p className="text-sm text-slate-200 mb-4">Skapa AI-avatarer för videor</p>
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                  Hantera avatarer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 hover:scale-105 transition-transform group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-purple-500/30 transition-colors">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Inställningar</h3>
                <p className="text-sm text-slate-200 mb-4">Anpassa ditt konto</p>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                  Konfigurera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Totala Projekt</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-300 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Redo att börja
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Videor Skapade</CardTitle>
              <Play className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-300 mt-1">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI-kraft väntar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Lagring Använd</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0 MB</div>
              <p className="text-xs text-slate-300 mt-1">av 1 GB tillgängligt</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Denna Månad</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-300 mt-1">rapporter bearbetade</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card className="h-fit bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Senaste Projekt</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">Nya</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Inga projekt ännu</h3>
                <p className="text-slate-200 mb-6 max-w-sm mx-auto">
                  Ladda upp din första finansiella rapport för att komma igång med AI-driven videogenerering.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 text-white transition-transform">
                  <Upload className="w-4 h-4 mr-2" />
                  Skapa Första Projektet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Overview */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <span>Kontoöversikt</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span className="text-sm font-medium text-slate-200">E-post</span>
                  <span className="text-sm text-white font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span className="text-sm font-medium text-slate-200">Kontotyp</span>
                  <Badge className="bg-yellow-500/20 text-yellow-300">Gratis Provperiod</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <span className="text-sm font-medium text-slate-200">Plan</span>
                  <span className="text-sm text-white font-medium">Starter</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-200">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Aktiv</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                Hantera Konto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
