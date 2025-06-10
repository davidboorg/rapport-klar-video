
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProcessingPipeline, ProcessingStep } from '@/hooks/useProcessingPipeline';
import { formatTimeRemaining } from './utils';

interface ProcessingPipelineViewerProps {
  pipeline: ProcessingPipeline;
  isProcessing: boolean;
  showTechnicalDetails: boolean;
  notifications: string[];
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onToggleTechnicalDetails: () => void;
}

const ProcessingPipelineViewer: React.FC<ProcessingPipelineViewerProps> = ({
  pipeline,
  isProcessing,
  showTechnicalDetails,
  notifications,
  onPause,
  onResume,
  onRetry,
  onToggleTechnicalDetails
}) => {
  const getStepIcon = (step: ProcessingStep, isCurrentStep: boolean) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (step.status === 'processing' && isCurrentStep) {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepStatus = (step: ProcessingStep) => {
    switch (step.status) {
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
    const currentStep = pipeline.steps[pipeline.currentStepIndex];
    if (!currentStep) return 'Initializing...';
    
    if (pipeline.status === 'completed') {
      return 'All processing steps completed successfully!';
    } else if (pipeline.status === 'failed') {
      return `Failed at: ${currentStep.name}`;
    } else if (pipeline.status === 'paused') {
      return `Paused at: ${currentStep.name}`;
    } else {
      return currentStep.description;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Processing Pipeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTechnicalDetails}
              >
                {showTechnicalDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
              </Button>
              
              {pipeline.canPause && isProcessing && (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {pipeline.canResume && !isProcessing && (
                <Button variant="outline" size="sm" onClick={onResume}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              {pipeline.status === 'failed' && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {pipeline.estimatedTimeRemaining > 0 ? 
                  formatTimeRemaining(pipeline.estimatedTimeRemaining) : 
                  'Complete'
                }
              </div>
            </div>
            <Progress value={pipeline.overallProgress} className="h-3" />
            <div className="text-center text-sm text-gray-600">
              {Math.round(pipeline.overallProgress)}% Complete
            </div>
          </div>

          {/* Current Status */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {pipeline.status === 'processing' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : pipeline.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : pipeline.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-blue-900">
                  {getCurrentStatusMessage()}
                </p>
                <p className="text-sm text-blue-700">
                  Step {pipeline.currentStepIndex + 1} of {pipeline.steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            <h4 className="font-medium">Processing Steps</h4>
            <div className="space-y-3">
              {pipeline.steps.map((step, index) => {
                const isCurrentStep = index === pipeline.currentStepIndex;
                const isActive = index <= pipeline.currentStepIndex;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isCurrentStep 
                        ? 'bg-blue-50 border border-blue-200' 
                        : isActive
                        ? 'bg-gray-50 border border-gray-200'
                        : 'bg-white border border-gray-100'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getStepIcon(step, isCurrentStep)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium">{step.name}</h5>
                        {getStepStatus(step)}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      
                      {step.status === 'processing' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{Math.round(step.progress)}%</span>
                          </div>
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                      
                      {step.errorMessage && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {step.errorMessage}
                        </div>
                      )}
                      
                      {showTechnicalDetails && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <div>Estimated Duration: {step.estimatedDuration / 1000}s</div>
                          {step.actualDuration && (
                            <div>Actual Duration: {(step.actualDuration / 1000).toFixed(1)}s</div>
                          )}
                          {step.startTime && (
                            <div>Started: {step.startTime.toLocaleTimeString()}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice().reverse().map((notification, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded border-l-4 ${
                    index === 0 
                      ? 'bg-blue-50 border-blue-400 text-blue-800' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                >
                  {notification}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {showTechnicalDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Pipeline ID:</span>
                <br />
                <code className="text-xs">{pipeline.id}</code>
              </div>
              <div>
                <span className="font-medium">Started:</span>
                <br />
                {pipeline.startTime.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Update:</span>
                <br />
                {pipeline.lastUpdate.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <br />
                <Badge variant="outline">{pipeline.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessingPipelineViewer;
