
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Avatar {
  id: string;
  user_id: string;
  heygen_avatar_id: string | null;
  name: string;
  status: 'creating' | 'processing' | 'completed' | 'failed';
  thumbnail_url: string | null;
  preview_video_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAvatars = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvatars();
    }
  }, [user]);

  const fetchAvatars = async () => {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvatars(data || []);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta avatarer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAvatar = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          name,
          status: 'creating'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvatars();
      toast({
        title: "Avatar skapad",
        description: `${name} har skapats och är redo för träning`,
      });

      return data;
    } catch (error) {
      console.error('Error creating avatar:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa avatar",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAvatar = async (avatarId: string) => {
    try {
      const { error } = await supabase
        .from('user_avatars')
        .delete()
        .eq('id', avatarId);

      if (error) throw error;

      await fetchAvatars();
      toast({
        title: "Avatar borttagen",
        description: "Avataren har tagits bort",
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort avatar",
        variant: "destructive",
      });
    }
  };

  const updateAvatarStatus = async (avatarId: string, status: Avatar['status']) => {
    try {
      const { error } = await supabase
        .from('user_avatars')
        .update({ status })
        .eq('id', avatarId);

      if (error) throw error;
      await fetchAvatars();
    } catch (error) {
      console.error('Error updating avatar status:', error);
    }
  };

  return {
    avatars,
    loading,
    createAvatar,
    deleteAvatar,
    updateAvatarStatus,
    refreshAvatars: fetchAvatars
  };
};
