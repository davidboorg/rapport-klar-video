
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Video, Clock, TrendingUp, Users, Play, Plus, ChevronRight } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Fel filformat",
        description: "Endast PDF-filer stöds för tillfället",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Uppladdning klar!",
            description: `${file.name} har bearbetats framgångsrikt`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const stats = [
    {
      name: "Skapade videor",
      value: "24",
      change: "+12%",
      changeType: "increase",
      icon: Video,
    },
    {
      name: "Denna månad",
      value: "8",
      change: "+4",
      changeType: "increase", 
      icon: TrendingUp,
    },
    {
      name: "Genomsnittlig tid",
      value: "3.2 min",
      change: "-0.5 min",
      changeType: "decrease",
      icon: Clock,
    },
    {
      name: "Prenumeration",
      value: "Pro",
      change: "Aktiv",
      changeType: "neutral",
      icon: Users,
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: "Q3 2024 Kvartalsrapport",
      status: "Klar",
      createdAt: "2024-01-15",
      type: "Kvartalsrapport",
    },
    {
      id: 2,
      name: "Årsredovisning 2023",
      status: "Bearbetas",
      createdAt: "2024-01-14",
      type: "Årsredovisning",
    },
    {
      id: 3,
      name: "Q2 2024 Delårsrapport", 
      status: "Klar",
      createdAt: "2024-01-13",
      type: "Delårsrapport",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Välkommen tillbaka, {user?.firstName}!
          </h1>
          <p className="text-slate-600 mt-2">
            Här är en översikt över dina projekt och aktivitet
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((item) => (
            <Card key={item.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-slate-900">
                          {item.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'increase' ? 'text-green-600' :
                          item.changeType === 'decrease' ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Ladda upp ny rapport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mx-auto max-w-md">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    {isDragActive ? (
                      <p className="text-lg text-blue-600 font-medium">
                        Släpp filen här...
                      </p>
                    ) : (
                      <>
                        <p className="text-lg text-slate-900 font-medium mb-2">
                          Dra och släpp din PDF här, eller klicka för att välja
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                          Stöder PDF-filer upp till 50MB
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Välj fil
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Laddar upp och bearbetar...
                      </span>
                      <span className="text-sm text-slate-500">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Snabbåtgärder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/templates">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    Bläddra bland mallar
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Visa alla projekt
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Nytt projekt
                </Button>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Månadsanvändning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Videor skapade</span>
                      <span className="text-sm font-medium">8/25</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">Lagringsutrymme</span>
                      <span className="text-sm font-medium">2.4/10 GB</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Uppgradera plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Projects */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Senaste projekt</CardTitle>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                Visa alla
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.type} • {project.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={project.status === "Klar" ? "default" : "secondary"}
                      className={project.status === "Klar" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                    >
                      {project.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
