
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  Brain,
  Sparkles,
  Upload
} from 'lucide-react';
import { ProcessingTask } from '@/hooks/useAdvancedProcessing';

interface AdvancedProcessingViewerProps {
  tasks: ProcessingTask[];
  currentTaskIndex: number;
  isProcessing: boolean;
  overallProgress: number;
}

const AdvancedProcessingViewer: React.FC<AdvancedProcessingViewerProps> = ({
  tasks,
  currentTaskIndex,
  isProcessing,
  overallProgress
}) => {
  const getTaskIcon = (task: ProcessingTask, index: number) => {
    const icons = {
      'document-upload': Upload,
      'content-extraction': FileText,
      'ai-analysis': Brain,
      'content-generation': Sparkles
    };

    const IconComponent = icons[task.id as keyof typeof icons] || FileText;

    if (task.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (task.status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (task.status === 'processing') {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskBadge = (task: ProcessingTask) => {
    switch (task.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return '';
    const endTime = end || new Date();
    const duration = Math.round((endTime.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Advanced Document Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {isProcessing && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-900">
                  Processing step {currentTaskIndex + 1} of {tasks.length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Processing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  task.status === 'processing' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : task.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : task.status === 'failed'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getTaskIcon(task, index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center gap-2">
                      {getTaskBadge(task)}
                      {task.startTime && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(task.startTime, task.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  
                  {task.status === 'processing' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(task.progress)}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}

                  {task.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                      Error: {task.error}
                    </div>
                  )}

                  {task.result && task.status === 'completed' && (
                    <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-700">
                      ✓ Task completed successfully
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EU Compliance Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              EU-Compliant Processing - All data processed within EU boundaries
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedProcessingViewer;
