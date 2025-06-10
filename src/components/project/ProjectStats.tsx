
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Eye,
  Share2
} from 'lucide-react';

interface ProjectStatsProps {
  stats: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
    totalViews: number;
    totalShares: number;
    usageLimit: number;
    usageUsed: number;
  };
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ stats }) => {
  const usagePercentage = (stats.usageUsed / stats.usageLimit) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {stats.completed} completed
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.processing}</div>
          {stats.failed > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
              <AlertCircle className="h-3 w-3" />
              {stats.failed} failed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
            <Share2 className="h-3 w-3" />
            {stats.totalShares} shares
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.usageUsed}/{stats.usageLimit}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                usagePercentage > 80 ? 'bg-red-500' : 
                usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {usagePercentage.toFixed(1)}% used this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStats;
