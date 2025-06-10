import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Avatar {
  id: string;
  user_id: string;
  heygen_avatar_id: string | null;
  name: string;
  status: string; // Changed from union type to string to match database
  thumbnail_url: string | null;
  preview_video_url: string | null;
  created_at: string;
  updated_at: string;
  progress?: number; // Add progress tracking
}

export const useAvatars = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate progress for avatars in creating/processing status
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
  }, []);

  useEffect(() => {
    if (user) {
      fetchAvatars();
      
      // Set up real-time subscription for avatar updates
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_avatars',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time avatar update:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newAvatar = { 
                ...payload.new as Avatar, 
                progress: 5 // Start with 5% progress
              };
              setAvatars(prev => [newAvatar, ...prev]);
              console.log('New avatar created with initial progress:', newAvatar);
              toast({
                title: "Ny avatar",
                description: `${newAvatar.name} har lagts till`,
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedAvatar = payload.new as Avatar;
              setAvatars(prev => prev.map(avatar => 
                avatar.id === updatedAvatar.id ? { 
                  ...updatedAvatar, 
                  progress: updatedAvatar.status === 'completed' ? 100 : 
                           updatedAvatar.status === 'failed' ? 0 :
                           avatar.progress || 10 // Keep existing progress or set to 10%
                } : avatar
              ));
              
              console.log('Avatar updated:', updatedAvatar);
              
              // Show toast for status changes
              if (updatedAvatar.status === 'completed') {
                toast({
                  title: "Avatar färdig!",
                  description: `${updatedAvatar.name} är nu redo för användning`,
                });
              } else if (updatedAvatar.status === 'failed') {
                toast({
                  title: "Avatar misslyckades",
                  description: `Ett fel uppstod när ${updatedAvatar.name} skapades`,
                  variant: "destructive",
                });
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedAvatar = payload.old as Avatar;
              setAvatars(prev => prev.filter(avatar => avatar.id !== deletedAvatar.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

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
      
      setAvatars(avatarsWithProgress);
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

      // No need to manually fetchAvatars() since real-time will handle it
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

      // No need to manually fetchAvatars() since real-time will handle it
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

  const updateAvatarStatus = async (avatarId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_avatars')
        .update({ status })
        .eq('id', avatarId);

      if (error) throw error;
      // No need to manually fetchAvatars() since real-time will handle it
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
