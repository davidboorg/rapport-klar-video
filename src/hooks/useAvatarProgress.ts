
import { useEffect } from 'react';
import { Avatar } from '@/types/avatar';

export const useAvatarProgress = (
  avatars: Avatar[],
  setAvatars: React.Dispatch<React.SetStateAction<Avatar[]>>
) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setAvatars(prev => prev.map(avatar => {
        if (avatar.status === 'creating' || avatar.status === 'processing') {
          const currentProgress = avatar.progress || 0;
          // Slower progress increment for more realistic feel
          const increment = Math.random() * 5 + 2; // 2-7% increment
          const newProgress = Math.min(currentProgress + increment, 95);
          
          console.log(`Avatar ${avatar.name} progress: ${Math.round(newProgress)}%`);
          
          return { ...avatar, progress: newProgress };
        }
        return avatar;
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [setAvatars]);
};
