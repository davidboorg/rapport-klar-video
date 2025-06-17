
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, FileText, Clock, Zap } from 'lucide-react';

interface MarketSelectorProps {
  onMarketSelect: (market: 'ir' | 'board') => void;
}

const MarketSelector = ({ onMarketSelect }: MarketSelectorProps) => {
  const [selectedMarket, setSelectedMarket] = useState<'ir' | 'board' | null>(null);

  const markets = [
    {
      id: 'ir' as const,
      title: 'Public Company IR',
      subtitle: 'Investor Relations & Communications',
      description: 'Transform quarterly reports into engaging investor communications',
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      features: [
        'Quarterly/Annual report processing',
        'Professional video presentations',
        'Investor-focused podcasts',
        'Premium branding & customization',
        'IR website integration'
      ],
      pricing: '$2,000-8,000/month',
      audience: 'Public companies, IR professionals',
      benefit: 'Professional investor communications at scale'
    },
    {
      id: 'board' as const,
      title: 'Board Management',
      subtitle: 'Strategic Decision Support',
      description: 'Reduce 3-hour board meetings to 30-minute strategic sessions',
      icon: <Users className="w-8 h-8 text-purple-600" />,
      features: [
        'Monthly financial report processing',
        'Pre-meeting podcast briefings',
        'Portfolio management for multiple companies',
        'Strategic summary generation',
        'Decision point highlighting'
      ],
      pricing: '$500-15,000/month',
      audience: 'Board members, private companies',
      benefit: 'Eliminate unnecessary time in boardrooms'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">ReportFlow</h1>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Financial Intelligence Platform
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choose your market to get started with AI-powered financial communication
          </p>
        </div>

        {/* Market Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {markets.map((market) => (
            <Card 
              key={market.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedMarket === market.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedMarket(market.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {market.icon}
                    <div>
                      <CardTitle className="text-xl">{market.title}</CardTitle>
                      <p className="text-sm text-slate-600">{market.subtitle}</p>
                    </div>
                  </div>
                  {selectedMarket === market.id && (
                    <Badge className="bg-blue-100 text-blue-700">Selected</Badge>
                  )}
                </div>
                <p className="text-slate-700 mt-2">{market.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-medium mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {market.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing & Audience */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">For: {market.audience}</span>
                    <Badge variant="outline">{market.pricing}</Badge>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    {market.benefit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        {selectedMarket && (
          <div className="text-center">
            <Button 
              onClick={() => onMarketSelect(selectedMarket)}
              size="lg"
              className="px-8 py-3"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started with {markets.find(m => m.id === selectedMarket)?.title}
            </Button>
          </div>
        )}

        {/* Platform Benefits */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            Why Choose ReportFlow?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Save Hours</h4>
              <p className="text-sm text-slate-600">
                From weeks of preparation to minutes of AI-powered insights
              </p>
            </div>
            <div className="text-center">
              <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Professional Quality</h4>
              <p className="text-sm text-slate-600">
                Executive-grade presentations at fraction of traditional cost
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Data-Driven Insights</h4>
              <p className="text-sm text-slate-600">
                Advanced AI analysis for strategic decision-making
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSelector;
