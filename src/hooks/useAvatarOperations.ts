
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/types/avatar';

export const useAvatarOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createAvatar = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('berget-api-proxy', {
        body: {
          action: 'createAvatar',
          payload: {
            user_id: user.id,
            name,
            status: 'creating' as const
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Avatar Created",
        description: `${name} has been created and is ready for training`,
      });

      return data;
    } catch (error) {
      console.error('Error creating avatar:', error);
      toast({
        title: "Error",
        description: "Could not create avatar",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAvatar = async (avatarId: string) => {
    try {
      const { error } = await supabase.functions.invoke('berget-api-proxy', {
        body: {
          action: 'deleteAvatar',
          payload: { avatarId }
        }
      });

      if (error) throw error;

      toast({
        title: "Avatar Deleted",
        description: "The avatar has been removed",
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "Could not delete avatar",
        variant: "destructive",
      });
    }
  };

  const updateAvatarStatus = async (avatarId: string, status: Avatar['status']) => {
    try {
      const { error } = await supabase.functions.invoke('berget-api-proxy', {
        body: {
          action: 'updateAvatar',
          payload: { avatarId, status }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating avatar status:', error);
    }
  };

  const refreshAvatarData = async (avatarId: string) => {
    try {
      toast({
        title: "Updating Avatar Data",
        description: "Fetching latest information from Berget.ai...",
      });

      const { data, error } = await supabase.functions.invoke('refresh-avatar-data', {
        body: { avatarId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Avatar Data Updated",
          description: "Latest information has been fetched from Berget.ai",
        });
      } else {
        toast({
          title: "No Update Available",
          description: "Berget.ai has no new information for this avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error refreshing avatar data:', error);
      toast({
        title: "Update Error",
        description: "Could not fetch updated avatar data",
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
