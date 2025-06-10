
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvatars } from '@/hooks/useAvatars';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Bug, AlertTriangle, CheckCircle } from 'lucide-react';

interface DebugInfo {
  avatarStatus: string;
  timeSinceCreation: string;
  heygenId: string | null;
  lastUpdated: string;
  possibleIssues: string[];
}

const AvatarDebugPanel = ({ avatarId }: { avatarId: string }) => {
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAvatarStatus = async () => {
    setLoading(true);
    try {
      const { data: avatar, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('id', avatarId)
        .single();

      if (error) throw error;

      const createdAt = new Date(avatar.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      const possibleIssues = [];
      
      if (minutesAgo > 10 && avatar.status === 'creating') {
        possibleIssues.push('Avatar har varit i "creating" status för länge');
      }
      
      if (!avatar.heygen_avatar_id && avatar.status !== 'failed') {
        possibleIssues.push('Inget HeyGen Avatar ID - API-anrop kanske misslyckades');
      }
      
      if (avatar.status === 'processing' && minutesAgo > 15) {
        possibleIssues.push('Avatar har varit i "processing" status för länge');
      }

      setDebugInfo({
        avatarStatus: avatar.status,
        timeSinceCreation: `${minutesAgo} minuter sedan`,
        heygenId: avatar.heygen_avatar_id,
        lastUpdated: new Date(avatar.updated_at).toLocaleString('sv-SE'),
        possibleIssues
      });

      console.log('Avatar debug info:', {
        id: avatar.id,
        name: avatar.name,
        status: avatar.status,
        heygen_avatar_id: avatar.heygen_avatar_id,
        created_at: avatar.created_at,
        updated_at: avatar.updated_at,
        minutes_since_creation: minutesAgo
      });

    } catch (error) {
      console.error('Error checking avatar status:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta avatar-status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forceRetryCreation = async () => {
    setLoading(true);
    try {
      // Reset avatar to creating status
      const { error } = await supabase
        .from('user_avatars')
        .update({ 
          status: 'creating',
          updated_at: new Date().toISOString()
        })
        .eq('id', avatarId);

      if (error) throw error;

      toast({
        title: "Avatar återställd",
        description: "Avatar-skapandet har startats om",
      });

      // Trigger the edge function again
      await supabase.functions.invoke('create-heygen-avatar', {
        body: { 
          avatarId,
          videoUrl: 'dummy_url' // We'll need the actual video URL here
        }
      });

    } catch (error) {
      console.error('Error retrying avatar creation:', error);
      toast({
        title: "Fel",
        description: "Kunde inte starta om avatar-skapandet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsFailed = async () => {
    try {
      const { error } = await supabase
        .from('user_avatars')
        .update({ status: 'failed' })
        .eq('id', avatarId);

      if (error) throw error;

      toast({
        title: "Avatar markerad som misslyckad",
        description: "Du kan nu skapa en ny avatar",
      });
    } catch (error) {
      console.error('Error marking avatar as failed:', error);
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bug className="h-5 w-5 text-yellow-600" />
          Avatar Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkAvatarStatus} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Kontrollera Status
          </Button>
          
          <Button 
            onClick={markAsFailed} 
            variant="destructive"
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Markera som Misslyckad
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Status:</strong>
                <Badge className="ml-2" variant={
                  debugInfo.avatarStatus === 'completed' ? 'default' :
                  debugInfo.avatarStatus === 'failed' ? 'destructive' : 
                  'secondary'
                }>
                  {debugInfo.avatarStatus}
                </Badge>
              </div>
              <div>
                <strong>Tid sedan skapande:</strong> {debugInfo.timeSinceCreation}
              </div>
              <div>
                <strong>HeyGen ID:</strong> {debugInfo.heygenId || 'Saknas'}
              </div>
              <div>
                <strong>Senast uppdaterad:</strong> {debugInfo.lastUpdated}
              </div>
            </div>

            {debugInfo.possibleIssues.length > 0 && (
              <div className="mt-4">
                <strong className="text-red-600">Möjliga problem:</strong>
                <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                  {debugInfo.possibleIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {debugInfo.possibleIssues.length === 0 && debugInfo.avatarStatus !== 'completed' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Inga uppenbara problem upptäckta</span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <strong>Tips:</strong> Kolla Developer Console (Cmd+Option+I) för detaljerade logs eller kontakta support om problemet kvarstår.
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarDebugPanel;
