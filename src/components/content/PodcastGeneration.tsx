import React, { Suspense } from 'react';
const IRCommunicationSuite = React.lazy(() => import('../ir/IRCommunicationSuite'));

interface PodcastGenerationProps {
  projectId: string;
  scriptText: string;
  marketType: 'ir' | 'board';
  onPodcastGenerated?: (podcastUrl: string) => void;
}

const PodcastGeneration = ({ 
  projectId, 
  scriptText, 
  marketType, 
  onPodcastGenerated 
}: PodcastGenerationProps) => {
  // For IR market, use the advanced suite
  if (marketType === 'ir') {
    return (
      <Suspense fallback={<div className="p-8 text-center">Laddar kommunikationssvit...</div>}>
        <IRCommunicationSuite
          projectId={projectId}
          scriptText={scriptText}
          onPodcastGenerated={onPodcastGenerated}
        />
      </Suspense>
    );
  }

  // For board market, keep existing simple interface
  return (
    <div className="text-center p-8">
      <h3 className="text-xl font-bold mb-4">Board Communication</h3>
      <p className="text-muted-foreground">
        Board-specific podcast features coming soon.
      </p>
    </div>
  );
};

export default PodcastGeneration;
