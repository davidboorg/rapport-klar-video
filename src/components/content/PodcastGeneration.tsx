import React from 'react';
import IRCommunicationSuite from '../ir/IRCommunicationSuite';

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
      <IRCommunicationSuite
        projectId={projectId}
        scriptText={scriptText}
        onPodcastGenerated={onPodcastGenerated}
      />
    );
  }

  // For board market, keep existing simple interface
  return (
    <div className="text-center p-8">
      <h3 className="text-xl font-bold mb-4">Board Communication</h3>
      <p className="text-gray-600">
        Board-specific podcast features coming soon.
      </p>
    </div>
  );
};

export default PodcastGeneration;
