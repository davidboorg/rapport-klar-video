
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  FileText, 
  Video, 
  Mic, 
  Calendar,
  Users,
  Download,
  Share2,
  Plus,
  BarChart
} from 'lucide-react';

interface IRProject {
  id: string;
  title: string;
  type: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  year: number;
  status: 'draft' | 'processing' | 'completed';
  created_at: string;
  content_types: Array<'video' | 'podcast' | 'summary'>;
  company_name: string;
}

const IRDashboard = () => {
  const [projects] = useState<IRProject[]>([
    {
      id: '1',
      title: 'Q4 2024 Earnings Report',
      type: 'Q4',
      year: 2024,
      status: 'completed',
      created_at: '2024-01-15',
      content_types: ['video', 'podcast', 'summary'],
      company_name: 'TechCorp AB'
    },
    {
      id: '2',
      title: 'Q1 2025 Investor Update',
      type: 'Q1',
      year: 2025,
      status: 'processing',
      created_at: '2024-04-10',
      content_types: ['video', 'summary'],
      company_name: 'TechCorp AB'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Q1': return 'bg-purple-100 text-purple-800';
      case 'Q2': return 'bg-blue-100 text-blue-800';
      case 'Q3': return 'bg-orange-100 text-orange-800';
      case 'Q4': return 'bg-red-100 text-red-800';
      case 'Annual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investor Relations Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Create professional investor communications from financial reports
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New IR Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Reports Processed</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Videos Created</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Mic className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Podcasts Generated</p>
                <p className="text-2xl font-bold">15</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Investor Engagement</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Active Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <Badge className={getTypeColor(project.type)}>
                          {project.type} {project.year}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">
                        {project.company_name} • Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Content:</span>
                        {project.content_types.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type === 'video' && <Video className="w-3 h-3 mr-1" />}
                            {type === 'podcast' && <Mic className="w-3 h-3 mr-1" />}
                            {type === 'summary' && <FileText className="w-3 h-3 mr-1" />}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button size="sm">
                        Open Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>IR Communication Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium mb-2">Quarterly Earnings</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Professional template for quarterly financial results
                  </p>
                  <Button size="sm">Use Template</Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium mb-2">Annual Report</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Comprehensive annual financial review format
                  </p>
                  <Button size="sm">Use Template</Button>
                </div>
                
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium mb-2">Investor Update</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Strategic business update for investor briefings
                  </p>
                  <Button size="sm">Use Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Track engagement metrics and investor communication performance
                </p>
                <Button variant="outline">View Detailed Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IRDashboard;
