
import React from 'react';
import { Progress } from '@/components/ui/progress';

export const CompletedProgress: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Avatar creation progress</span>
        <span>100%</span>
      </div>
      <Progress value={100} className="h-3" />
      <div className="text-center text-sm text-green-600 font-medium">
        Avatar skapad framgångsrikt!
      </div>
    </div>
  );
};
