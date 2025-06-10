
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wand2,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { useProcessingPipeline } from "@/hooks/useProcessingPipeline";
import ProcessingPipelineViewer from "./processing/ProcessingPipelineViewer";
import ProcessingNotifications from "./processing/ProcessingNotifications";

interface ProcessingWorkflowProps {
  projectId: string;
  isProcessing?: boolean;
  currentStep?: number;
  onComplete?: (result: any) => void;
  autoStart?: boolean;
}

const ProcessingWorkflow = ({ 
  projectId, 
  isProcessing: externalIsProcessing, 
  currentStep = 0, 
  onComplete,
  autoStart = false 
}: ProcessingWorkflowProps) => {
  const {
    pipeline,
    isProcessing,
    showTechnicalDetails,
    notifications,
    startProcessing,
    pauseProcessing,
    resumeProcessing,
    retryFailedStep,
    setShowTechnicalDetails
  } = useProcessingPipeline(projectId);

  // Auto-start processing if requested
  useEffect(() => {
    if (autoStart && !pipeline && !isProcessing) {
      startProcessing();
    }
  }, [autoStart, pipeline, isProcessing, startProcessing]);

  // Call onComplete when pipeline finishes
  useEffect(() => {
    if (pipeline?.status === 'completed' && onComplete) {
      onComplete({
        success: true,
        pipeline: pipeline,
        duration: Date.now() - pipeline.startTime.getTime()
      });
    }
  }, [pipeline?.status, onComplete]);

  // If no pipeline exists yet, show start interface
  if (!pipeline) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wand2 className="w-6 h-6" />
              AI-Powered Report Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Transform your quarterly report into a professional video presentation 
                with our advanced AI processing pipeline.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Data Extraction</h4>
                  <p className="text-gray-600">
                    AI analyzes your PDF and extracts key financial metrics and insights
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Script Generation</h4>
                  <p className="text-gray-600">
                    Creates personalized scripts optimized for different audiences
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">Video Creation</h4>
                  <p className="text-gray-600">
                    Generates professional video with your avatar and voice
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={startProcessing}
              size="lg"
              className="w-full md:w-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Start AI Processing
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Estimated time: 2-3 minutes</p>
              <p>• Processing continues even if you leave this page</p>
              <p>• You'll receive notifications when complete</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Processing Pipeline */}
      <ProcessingPipelineViewer
        pipeline={pipeline}
        isProcessing={isProcessing}
        showTechnicalDetails={showTechnicalDetails}
        notifications={notifications}
        onPause={pauseProcessing}
        onResume={resumeProcessing}
        onRetry={retryFailedStep}
        onToggleTechnicalDetails={() => setShowTechnicalDetails(!showTechnicalDetails)}
      />

      {/* Notifications */}
      <ProcessingNotifications
        projectId={projectId}
        isProcessing={isProcessing}
        currentStep={pipeline.steps[pipeline.currentStepIndex]?.name}
        progress={pipeline.overallProgress}
      />

      {/* Processing Complete Actions */}
      {pipeline.status === 'completed' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Wand2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Processing Complete!
                </h3>
                <p className="text-sm text-green-600">
                  Your video is ready for customization and download
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()}>
                  View Results
                </Button>
                <Button variant="outline" onClick={startProcessing}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Process Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Failed Actions */}
      {pipeline.status === 'failed' && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Processing Failed
                </h3>
                <p className="text-sm text-red-600">
                  An error occurred during processing. You can retry or contact support.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={retryFailedStep}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Failed Step
                </Button>
                <Button variant="outline" onClick={startProcessing}>
                  Start Over
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessingWorkflow;
