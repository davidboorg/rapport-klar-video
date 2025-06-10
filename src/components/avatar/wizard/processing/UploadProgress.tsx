
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  progress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Upload progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3" />
      <div className="text-center text-sm text-muted-foreground">
        Laddar upp video säkert...
      </div>
    </div>
  );
};
