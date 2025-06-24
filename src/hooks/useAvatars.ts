
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/BergetAuthContext';
import { useAvatarProgress } from './useAvatarProgress';
import { useAvatarRealtime } from './useAvatarRealtime';
import { useAvatarOperations } from './useAvatarOperations';
import { useAvatarFetch } from './useAvatarFetch';

export type { Avatar } from '@/types/avatar';

export const useAvatars = () => {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState<any[]>([]);
  
  const { fetchAvatars, loading, setLoading } = useAvatarFetch();
  const { createAvatar, deleteAvatar, updateAvatarStatus, refreshAvatarData } = useAvatarOperations();
  
  // Use the progress simulation hook
  useAvatarProgress(avatars, setAvatars);
  
  // Use the real-time updates hook
  useAvatarRealtime(user, setAvatars);

  useEffect(() => {
    if (user) {
      const loadAvatars = async () => {
        const fetchedAvatars = await fetchAvatars();
        setAvatars(fetchedAvatars);
      };
      loadAvatars();
    }
  }, [user]);

  const refreshAvatars = async () => {
    if (user) {
      const fetchedAvatars = await fetchAvatars();
      setAvatars(fetchedAvatars);
    }
  };

  return {
    avatars,
    loading,
    createAvatar,
    deleteAvatar,
    updateAvatarStatus,
    refreshAvatarData,
    refreshAvatars: refreshAvatars
  };
};
