
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarRealtime = (
  user: any,
  setAvatars: React.Dispatch<React.SetStateAction<Avatar[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Set up real-time updates via Supabase realtime
    const channel = supabase
      .channel(`avatars_${user.id}`)
      .on('broadcast', { event: 'avatar_update' }, (payload) => {
        try {
          const update = payload.payload;
          console.log('Real-time avatar update:', update);
          
          if (update.type === 'AVATAR_CREATED') {
            const newAvatar = { 
              ...update.data, 
              progress: 5 // Start with 5% progress
            };
            setAvatars(prev => [newAvatar, ...prev]);
            console.log('New avatar created with initial progress:', newAvatar);
            toast({
              title: "New Avatar",
              description: `${newAvatar.name} has been added`,
            });
          } else if (update.type === 'AVATAR_UPDATED') {
            const updatedAvatar = update.data;
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
                title: "Avatar Ready!",
                description: `${updatedAvatar.name} is now ready for use`,
              });
            } else if (updatedAvatar.status === 'failed') {
              toast({
                title: "Avatar Failed",
                description: `An error occurred while creating ${updatedAvatar.name}`,
                variant: "destructive",
              });
            }
          } else if (update.type === 'AVATAR_DELETED') {
            const deletedAvatar = update.data;
            setAvatars(prev => prev.filter(avatar => avatar.id !== deletedAvatar.id));
          }
        } catch (error) {
          console.error('Error parsing real-time message:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, setAvatars]);
};
