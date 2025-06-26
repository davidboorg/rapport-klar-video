
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-brand-50 to-accent-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-3 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-neutral-700">Laddar din dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userName = user.email?.split('@')[0] || 'Användare';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-brand-50 to-accent-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-accent-500 animate-pulse-slow" />
            <h1 className="text-4xl font-bold gradient-text">
              Välkommen tillbaka, {userName}!
            </h1>
          </div>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Skapa professionella videor från dina finansiella rapporter med AI-kraft. 
            Börja din resa mot automatiserad rapportering idag.
          </p>
        </div>

        {/* Quick Actions - Primary CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="interactive-card border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-accent-100 col-span-full lg:col-span-2">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900">Starta ditt första projekt</h3>
                      <p className="text-neutral-600">Ladda upp en rapport och låt AI:n skapa magi</p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group">
                    <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Ladda upp rapport
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-accent-400 to-brand-500 rounded-2xl opacity-20 animate-pulse-slow"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mx-auto">
                <FolderOpen className="w-7 h-7 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Mina Projekt</h3>
                <p className="text-sm text-neutral-600 mb-4">Hantera dina befintliga projekt</p>
                <Button variant="outline" size="sm" className="w-full border-brand-200 text-brand-700 hover:bg-brand-50">
                  Visa alla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="interactive-card group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-accent-200 transition-colors">
                <Play className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Video Mallar</h3>
                <p className="text-sm text-neutral-600 mb-4">Utforska professionella mallar</p>
                <Button variant="ghost" size="sm" className="text-accent-600 hover:text-accent-700">
                  Bläddra mallar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-success-200 transition-colors">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Avatarer</h3>
                <p className="text-sm text-neutral-600 mb-4">Skapa AI-avatarer för videor</p>
                <Button variant="ghost" size="sm" className="text-success-600 hover:text-success-700">
                  Hantera avatarer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-card group">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-neutral-200 transition-colors">
                <Settings className="w-6 h-6 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Inställningar</h3>
                <p className="text-sm text-neutral-600 mb-4">Anpassa ditt konto</p>
                <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-700">
                  Konfigurera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glassmorphism border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Totala Projekt</CardTitle>
              <FileText className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">0</div>
              <p className="text-xs text-neutral-500 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Redo att börja
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Videor Skapade</CardTitle>
              <Play className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">0</div>
              <p className="text-xs text-neutral-500 mt-1">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI-kraft väntar
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Lagring Använd</CardTitle>
              <BarChart3 className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">0 MB</div>
              <p className="text-xs text-neutral-500 mt-1">av 1 GB tillgängligt</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Denna Månad</CardTitle>
              <TrendingUp className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">0</div>
              <p className="text-xs text-neutral-500 mt-1">rapporter bearbetade</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Senaste Projekt</span>
                <Badge variant="secondary" className="bg-accent-100 text-accent-700">Nya</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Inga projekt ännu</h3>
                <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
                  Ladda upp din första finansiella rapport för att komma igång med AI-driven videogenerering.
                </p>
                <Button className="bg-accent-500 hover:bg-accent-600 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Skapa Första Projektet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Kontoöversikt</span>
                <CheckCircle className="w-5 h-5 text-success-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-600">E-post</span>
                  <span className="text-sm text-neutral-900 font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-600">Kontotyp</span>
                  <Badge className="bg-brand-100 text-brand-800">Gratis Provperiod</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-600">Plan</span>
                  <span className="text-sm text-neutral-900 font-medium">Starter</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-neutral-600">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-success-600 font-medium">Aktiv</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-accent-200 text-accent-700 hover:bg-accent-50">
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
