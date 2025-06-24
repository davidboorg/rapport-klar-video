
import { useState } from 'react';
import { bergetClient } from '@/integrations/berget/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarFetch = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const fetchAvatars = async () => {
    try {
      // Use Berget.ai API to fetch avatars
      const { data, error } = await bergetClient.getAvatars();

      if (error) throw error;
      
      // Initialize progress for creating/processing avatars
      const avatarsWithProgress = (data || []).map(avatar => {
        let progress = 0;
        
        if (avatar.status === 'creating') {
          progress = Math.random() * 20 + 10; // 10-30% for creating
        } else if (avatar.status === 'processing') {
          progress = Math.random() * 30 + 40; // 40-70% for processing
        } else if (avatar.status === 'completed') {
          progress = 100;
        }
        
        console.log(`Initial avatar ${avatar.name} status: ${avatar.status}, progress: ${Math.round(progress)}%`);
        
        return {
          ...avatar,
          progress
        };
      });
      
      return avatarsWithProgress;
    } catch (error) {
      console.error('Error fetching avatars:', error);
      toast({
        title: "Error",
        description: "Could not fetch avatars",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchAvatars,
    loading,
    setLoading
  };
};
