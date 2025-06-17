
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Mic, 
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  Plus,
  Play,
  Download
} from 'lucide-react';

interface BoardProject {
  id: string;
  company_name: string;
  report_month: string;
  status: 'pending' | 'processed' | 'briefing_ready';
  urgency: 'low' | 'medium' | 'high';
  key_decisions: string[];
  podcast_duration: string;
  created_at: string;
}

interface PortfolioStats {
  total_companies: number;
  pending_reviews: number;
  urgent_decisions: number;
  avg_meeting_time_saved: string;
}

const BoardDashboard = () => {
  const [portfolioStats] = useState<PortfolioStats>({
    total_companies: 8,
    pending_reviews: 3,
    urgent_decisions: 2,
    avg_meeting_time_saved: '2.3 hours'
  });

  const [projects] = useState<BoardProject[]>([
    {
      id: '1',
      company_name: 'Nordic Tech Solutions',
      report_month: 'March 2025',
      status: 'briefing_ready',
      urgency: 'high',
      key_decisions: ['Budget approval for Q2', 'Strategic partnership decision'],
      podcast_duration: '12 min',
      created_at: '2025-04-01'
    },
    {
      id: '2',
      company_name: 'Green Energy Ventures',
      report_month: 'March 2025',
      status: 'processed',
      urgency: 'medium',
      key_decisions: ['Expansion timeline review', 'Sustainability metrics update'],
      podcast_duration: '8 min',
      created_at: '2025-03-28'
    },
    {
      id: '3',
      company_name: 'FinTech Innovations AB',
      report_month: 'March 2025',
      status: 'pending',
      urgency: 'low',
      key_decisions: ['Routine performance review'],
      podcast_duration: '—',
      created_at: '2025-03-25'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'briefing_ready': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Board Management Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Strategic briefings and decision support for your portfolio companies
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Reports
        </Button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Portfolio Companies</p>
                <p className="text-2xl font-bold">{portfolioStats.total_companies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold">{portfolioStats.pending_reviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Urgent Decisions</p>
                <p className="text-2xl font-bold">{portfolioStats.urgent_decisions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Time Saved/Meeting</p>
                <p className="text-2xl font-bold">{portfolioStats.avg_meeting_time_saved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="briefings">Ready Briefings</TabsTrigger>
          <TabsTrigger value="insights">Cross-Portfolio Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{project.company_name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getUrgencyColor(project.urgency)}>
                          {project.urgency} priority
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">
                        {project.report_month} • Uploaded {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">Podcast briefing: {project.podcast_duration}</span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Key decisions needed:</span>
                          <ul className="text-sm text-slate-600 ml-4 mt-1">
                            {project.key_decisions.map((decision, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                                {decision}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {project.status === 'briefing_ready' && (
                        <Button size="sm" className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          Listen Briefing
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="briefings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Ready for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.filter(p => p.status === 'briefing_ready').map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{project.company_name}</h4>
                      <p className="text-sm text-slate-600">{project.report_month} • {project.podcast_duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(project.urgency)}>
                        {project.urgency} priority
                      </Badge>
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Play Briefing
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Portfolio Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Cross-Portfolio Analysis</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Identify trends and patterns across your portfolio companies
                </p>
                <Button variant="outline">Generate Insights Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BoardDashboard;
