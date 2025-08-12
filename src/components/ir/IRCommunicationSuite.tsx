
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  TrendingUp,
  Users,
  Globe,
  Mic2,
  FileText,
  Settings,
  Star,
  Building,
  Brain,
  Headphones
} from 'lucide-react';
import AdvancedPodcastStudio from './AdvancedPodcastStudio';

interface IRCommunicationSuiteProps {
  projectId: string;
  scriptText: string;
  financialData?: any;
  onPodcastGenerated?: (podcastUrl: string) => void;
}

const IRCommunicationSuite: React.FC<IRCommunicationSuiteProps> = ({
  projectId,
  scriptText,
  financialData,
  onPodcastGenerated
}) => {
  const [activeTab, setActiveTab] = useState('podcast');

  const features = [
    {
      icon: Mic2,
      title: 'Premium Voice AI',
      description: 'ElevenLabs professional voices with emotional intelligence'
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: '8 languages for international investor relations'
    },
    {
      icon: Brain,
      title: 'Smart Tone Control',
      description: 'AI-powered emotional and professional tone adjustment'
    },
    {
      icon: Building,
      title: 'Enterprise Ready',
      description: 'Broadcast-quality audio for corporate communications'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Professional IR Communication Suite
            </span>
          </CardTitle>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your investor relations with enterprise-grade AI voices, 
            emotional intelligence, and global market support powered by ElevenLabs.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-blue-100 text-blue-700">
              <Star className="w-3 h-3 mr-1" />
              Enterprise Grade
            </Badge>
            <Badge className="bg-green-100 text-green-700">
              <Globe className="w-3 h-3 mr-1" />
              Global Ready
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <Brain className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-0 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="podcast" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Premium Podcast
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics (Soon)
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Distribution (Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="podcast" className="mt-6">
          <AdvancedPodcastStudio
            projectId={projectId}
            scriptText={scriptText}
            financialData={financialData}
            onPodcastGenerated={onPodcastGenerated}
          />
        </TabsContent>


        <TabsContent value="analytics" className="mt-6">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Track engagement, listening patterns, and investor sentiment 
              across all your IR communications.
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Distribution</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Automated distribution to investor portals, media outlets, 
              and podcast platforms with performance tracking.
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Insights (if financial data available) */}
      {financialData && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Company Context for AI Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Company:</span>
                <p className="text-gray-700">{financialData.company_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Period:</span>
                <p className="text-gray-700">{financialData.period || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Performance:</span>
                <p className="text-gray-700">
                  {financialData.growth_percentage ? `${financialData.growth_percentage} growth` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              ✨ AI will automatically optimize tone and messaging based on your company's performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IRCommunicationSuite;
