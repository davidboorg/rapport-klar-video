
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Zap,
  Globe,
  Brain,
  FileText,
  BarChart3
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
  const getTaskIcon = (task: ProcessingTask, isCurrentTask: boolean) => {
    if (task.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (task.status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (task.status === 'processing' && isCurrentTask) {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return getIconForTask(task.id);
    }
  };

  const getIconForTask = (taskId: string) => {
    switch (taskId) {
      case 'analysis':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'chunking':
        return <BarChart3 className="w-5 h-5 text-gray-400" />;
      case 'extraction':
        return <Brain className="w-5 h-5 text-gray-400" />;
      case 'generation':
        return <Zap className="w-5 h-5 text-gray-400" />;
      case 'validation':
        return <Shield className="w-5 h-5 text-gray-400" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
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

  const getCurrentStatusMessage = () => {
    if (tasks.length === 0) return 'Initializing advanced processing...';
    
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) return 'Processing complete';
    
    if (currentTask.status === 'processing') {
      return `${currentTask.name}: ${currentTask.description}`;
    } else if (currentTask.status === 'completed') {
      return 'All processing stages completed successfully!';
    } else if (currentTask.status === 'failed') {
      return `Failed at: ${currentTask.name}`;
    } else {
      return `Preparing: ${currentTask.name}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* EU Compliance Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">EU-Compliant Processing</h3>
              <p className="text-sm text-blue-700">
                Your document is being processed using Berget.ai's GDPR-compliant AI systems with EU data residency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Advanced Document Processing
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Current Status */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : overallProgress === 100 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-blue-900">
                  {getCurrentStatusMessage()}
                </p>
                <p className="text-sm text-blue-700">
                  Stage {Math.min(currentTaskIndex + 1, tasks.length)} of {tasks.length}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Stages */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Processing Stages</h4>
              <div className="space-y-3">
                {tasks.map((task, index) => {
                  const isCurrentTask = index === currentTaskIndex;
                  const isActive = index <= currentTaskIndex;
                  
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                        isCurrentTask 
                          ? 'bg-blue-50 border border-blue-200' 
                          : isActive
                          ? 'bg-gray-50 border border-gray-200'
                          : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getTaskIcon(task, isCurrentTask)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{task.name}</h5>
                          {getTaskBadge(task)}
                        </div>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        
                        {task.status === 'processing' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{Math.round(task.progress)}%</span>
                            </div>
                            <Progress value={task.progress} className="h-1" />
                          </div>
                        )}
                        
                        {task.details && (
                          <div className="mt-2 text-sm text-red-600">
                            {task.details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              End-to-end encryption
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4 text-blue-600" />
              EU data residency
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {overallProgress === 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Processing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-sm text-gray-600">Stages Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">EU</div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedProcessingViewer;
