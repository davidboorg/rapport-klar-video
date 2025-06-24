
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/BergetAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Users, 
  TrendingUp, 
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';

const Templates = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const templates = [
    {
      id: 1,
      name: "Executive Summary",
      description: "Perfect for board presentations and executive updates",
      duration: "2-3 minutes",
      icon: <Building className="w-6 h-6" />,
      features: ["Key metrics", "Strategic insights", "Professional tone"],
      popular: true
    },
    {
      id: 2,
      name: "Investor Relations",
      description: "Designed for quarterly earnings and investor communications",
      duration: "3-5 minutes",
      icon: <TrendingUp className="w-6 h-6" />,
      features: ["Financial highlights", "Growth metrics", "Market analysis"],
      popular: false
    },
    {
      id: 3,
      name: "Team Update",
      description: "Share company performance with your internal teams",
      duration: "1-2 minutes",
      icon: <Users className="w-6 h-6" />,
      features: ["Simplified metrics", "Team achievements", "Friendly tone"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Video Templates</h1>
          <p className="text-slate-600">
            Choose a template that fits your audience and communication goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative overflow-hidden">
              {template.popular && (
                <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
                  Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{template.duration}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{template.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
