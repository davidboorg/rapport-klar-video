
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  const refreshAvatarData = async (avatarId: string) => {
    try {
      toast({
        title: "Uppdaterar avatar-data",
        description: "Hämtar senaste information från HeyGen...",
      });

      const { data, error } = await supabase.functions.invoke('refresh-avatar-data', {
        body: { avatarId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Avatar-data uppdaterad",
          description: "Senaste information har hämtats från HeyGen",
        });
      } else {
        toast({
          title: "Ingen uppdatering tillgänglig",
          description: "HeyGen har ingen ny information för denna avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error refreshing avatar data:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte hämta uppdaterad avatar-data",
        variant: "destructive",
      });
    }
  };

  return {
    createAvatar,
    deleteAvatar,
    updateAvatarStatus,
    refreshAvatarData
  };
};
