import React from 'react';
import { useAvatars } from '@/hooks/useAvatars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, User, Play, Trash2, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AvatarDebugPanel from './AvatarDebugPanel';

const AvatarLibrary = () => {
  const { avatars, loading, deleteAvatar } = useAvatars();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'creating': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Färdig';
      case 'processing': return 'Bearbetas';
      case 'creating': return 'Skapas';
      case 'failed': return 'Misslyckades';
      default: return 'Okänd';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'creating': return <Clock className="h-4 w-4 animate-pulse" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Check if any avatar has been in creating/processing state for too long
  const stuckAvatars = avatars.filter(avatar => {
    const createdAt = new Date(avatar.created_at);
    const now = new Date();
    const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return (avatar.status === 'creating' || avatar.status === 'processing') && minutesAgo > 10;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mina Avatarer</h2>
          <p className="text-muted-foreground">
            Hantera dina AI-avatarer för videopresentationer
          </p>
        </div>
        <Button asChild>
          <Link to="/avatars/create">
            <Plus className="h-4 w-4 mr-2" />
            Skapa Avatar
          </Link>
        </Button>
      </div>

      {/* Show debug panel if there are stuck avatars */}
      {stuckAvatars.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-yellow-600">⚠️ Avatarer som verkar ha fastnat</h3>
          {stuckAvatars.map(avatar => (
            <AvatarDebugPanel key={avatar.id} avatarId={avatar.id} />
          ))}
        </div>
      )}

      {avatars.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inga avatarer ännu</h3>
            <p className="text-muted-foreground mb-6">
              Skapa din första AI-avatar för att börja göra personliga videopresentationer.
            </p>
            <Button asChild>
              <Link to="/avatars/create">
                <Plus className="h-4 w-4 mr-2" />
                Skapa Din Första Avatar
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {avatars.map((avatar) => (
            <Card key={avatar.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{avatar.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Skapad {new Date(avatar.created_at).toLocaleDateString('sv-SE')}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(avatar.status)} flex items-center gap-1`}>
                    {getStatusIcon(avatar.status)}
                    {getStatusText(avatar.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                  {avatar.thumbnail_url ? (
                    <img 
                      src={avatar.thumbnail_url} 
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* Enhanced progress bar for creating/processing avatars */}
                {(avatar.status === 'creating' || avatar.status === 'processing') && avatar.progress !== undefined && (
                  <div className="mb-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        {avatar.status === 'creating' ? 'Skapar avatar...' : 'Bearbetar avatar...'}
                      </span>
                      <span className="font-bold text-primary">
                        {Math.round(avatar.progress)}%
                      </span>
                    </div>
                    <Progress value={avatar.progress} className="h-3" />
                    <div className="text-center text-xs text-muted-foreground">
                      {avatar.status === 'creating' ? 
                        'Analyserar och förbereder din avatar...' : 
                        'Tränar AI-modellen med dina data...'
                      }
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {avatar.status === 'completed' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  )}
                  
                  {avatar.status === 'creating' && (
                    <div className="flex-1 text-center text-sm bg-yellow-50 text-yellow-700 py-2 px-3 rounded font-medium border border-yellow-200">
                      {avatar.progress !== undefined && avatar.progress > 0 ? 
                        `${Math.round(avatar.progress)}% färdig` : 
                        'Startar...'
                      }
                    </div>
                  )}
                  
                  {avatar.status === 'processing' && (
                    <div className="flex-1 text-center text-sm bg-blue-50 text-blue-700 py-2 px-3 rounded font-medium border border-blue-200">
                      {avatar.progress !== undefined ? 
                        `${Math.round(avatar.progress)}% färdig` : 
                        'Bearbetar...'
                      }
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteAvatar(avatar.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvatarLibrary;
