
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarFetch = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const fetchAvatars = async () => {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .order('created_at', { ascending: false });

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
        title: "Fel",
        description: "Kunde inte hämta avatarer",
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
