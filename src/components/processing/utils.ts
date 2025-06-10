
export const formatTimeRemaining = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const calculateProcessingProgress = (steps: any[], currentStepIndex: number): number => {
  if (steps.length === 0) return 0;
  
  let totalProgress = 0;
  
  // Add completed steps
  for (let i = 0; i < currentStepIndex; i++) {
    totalProgress += 100;
  }
  
  // Add current step progress
  if (currentStepIndex < steps.length) {
    totalProgress += steps[currentStepIndex].progress || 0;
  }
  
  return Math.min((totalProgress / (steps.length * 100)) * 100, 100);
};

export const getProcessingAnalytics = (steps: any[]) => {
  const completed = steps.filter(s => s.status === 'completed');
  const failed = steps.filter(s => s.status === 'failed');
  const processing = steps.filter(s => s.status === 'processing');
  
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  const totalActualTime = completed.reduce((sum, step) => sum + (step.actualDuration || 0), 0);
  
  return {
    completedSteps: completed.length,
    failedSteps: failed.length,
    processingSteps: processing.length,
    totalEstimatedTime,
    totalActualTime,
    averageStepTime: completed.length > 0 ? totalActualTime / completed.length : 0,
    efficiency: totalEstimatedTime > 0 ? (totalActualTime / totalEstimatedTime) * 100 : 0
  };
};
