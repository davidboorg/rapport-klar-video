
import React from 'react';
import { useAvatars, Avatar } from '@/hooks/useAvatars';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, User, Play, Trash2, Settings, Clock, CheckCircle, AlertCircle, RefreshCw, Sparkles, Video, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AvatarDebugPanel from './AvatarDebugPanel';

const AvatarLibrary = () => {
  const { avatars, loading, deleteAvatar, refreshAvatarData } = useAvatars();
  const { toast } = useToast();

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
      case 'completed': return 'Ready';
      case 'processing': return 'Processing';
      case 'creating': return 'Creating';
      case 'failed': return 'Failed';
      default: return 'Unknown';
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

  const handlePreview = (avatar: any) => {
    console.log('Preview clicked for avatar:', avatar);
    
    if (avatar.preview_video_url) {
      window.open(avatar.preview_video_url, '_blank');
      toast({
        title: "Opening preview",
        description: "Avatar video opens in a new tab",
      });
    } else if (avatar.thumbnail_url) {
      window.open(avatar.thumbnail_url, '_blank');
      toast({
        title: "Showing avatar image",
        description: "No video available, showing thumbnail instead",
      });
    } else {
      toast({
        title: "No preview available",
        description: "Avatar hasn't generated a preview yet",
        variant: "destructive",
      });
    }
  };

  const stuckAvatars = avatars.filter(avatar => {
    const createdAt = new Date(avatar.created_at);
    const now = new Date();
    const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return (avatar.status === 'creating' || avatar.status === 'processing') && minutesAgo > 10;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-white">Loading your avatars...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              My AI Avatars
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create and manage your personalized AI avatars for professional video presentations
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Link to="/avatars/create">
          <ModernButton size="lg" className="group">
            <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Create New Avatar
            <Sparkles className="h-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
          </ModernButton>
        </Link>
      </div>

      {/* Debug Panel for Stuck Avatars */}
      {stuckAvatars.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-yellow-600 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Avatars that seem to be stuck
          </h3>
          {stuckAvatars.map(avatar => (
            <AvatarDebugPanel key={avatar.id} avatarId={avatar.id} />
          ))}
        </div>
      )}

      {/* Avatar Grid or Empty State */}
      {avatars.length === 0 ? (
        <ModernCard className="max-w-2xl mx-auto p-12 text-center" variant="glass">
          <ModernCardContent className="p-0">
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto">
                <Video className="w-12 h-12 text-blue-400" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">No avatars yet</h3>
                <p className="text-slate-300 text-lg max-w-md mx-auto">
                  Create your first AI avatar to start making personalized video presentations that represent you professionally.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/avatars/create">
                  <ModernButton size="lg" className="group">
                    <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Create Your First Avatar
                  </ModernButton>
                </Link>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {avatars.map((avatar) => (
            <ModernCard key={avatar.id} className="p-6 hover:scale-105 transition-all duration-300" variant="glass">
              {/* Avatar Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{avatar.name}</h3>
                  <p className="text-sm text-slate-400">
                    Created {new Date(avatar.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
                <Badge className={`${getStatusColor(avatar.status)} text-white flex items-center gap-1 px-3 py-1`}>
                  {getStatusIcon(avatar.status)}
                  {getStatusText(avatar.status)}
                </Badge>
              </div>

              {/* Avatar Thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {avatar.thumbnail_url ? (
                  <img 
                    src={avatar.thumbnail_url} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
              </div>

              {/* Progress Bar for Creating/Processing */}
              {(avatar.status === 'creating' || avatar.status === 'processing') && avatar.progress !== undefined && (
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">
                      {avatar.status === 'creating' ? 'Creating avatar...' : 'Processing avatar...'}
                    </span>
                    <span className="font-bold text-blue-400">
                      {Math.round(avatar.progress)}%
                    </span>
                  </div>
                  <Progress value={avatar.progress} className="h-2" />
                  <div className="text-center text-xs text-slate-400">
                    {avatar.status === 'creating' ? 
                      'Analyzing and preparing your avatar...' : 
                      'Training AI model with your data...'
                    }
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {avatar.status === 'completed' && (
                  <>
                    <ModernButton 
                      variant="glass" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(avatar)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </ModernButton>
                    
                    {(!avatar.preview_video_url || !avatar.thumbnail_url) && (
                      <ModernButton 
                        variant="glass" 
                        size="sm"
                        onClick={() => refreshAvatarData(avatar.id)}
                        className="px-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </ModernButton>
                    )}
                  </>
                )}
                
                {avatar.status === 'creating' && (
                  <div className="flex-1 text-center text-sm bg-yellow-500/20 text-yellow-300 py-2 px-3 rounded-lg font-medium border border-yellow-500/30">
                    {avatar.progress !== undefined && avatar.progress > 0 ? 
                      `${Math.round(avatar.progress)}% complete` : 
                      'Starting...'
                    }
                  </div>
                )}
                
                {avatar.status === 'processing' && (
                  <div className="flex-1 text-center text-sm bg-blue-500/20 text-blue-300 py-2 px-3 rounded-lg font-medium border border-blue-500/30">
                    {avatar.progress !== undefined ? 
                      `${Math.round(avatar.progress)}% complete` : 
                      'Processing...'
                    }
                  </div>
                )}
                
                <ModernButton variant="glass" size="sm" className="px-3">
                  <Settings className="h-4 w-4" />
                </ModernButton>
                
                <ModernButton 
                  variant="glass" 
                  size="sm"
                  onClick={() => deleteAvatar(avatar.id)}
                  className="px-3 hover:bg-red-500/20 hover:border-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                </ModernButton>
              </div>
            </ModernCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvatarLibrary;
