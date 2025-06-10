
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarRealtime = (
  user: any,
  setAvatars: React.Dispatch<React.SetStateAction<Avatar[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

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
  }, [user, toast, setAvatars]);
};
