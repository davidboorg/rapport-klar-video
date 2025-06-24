
export interface Avatar {
  id: string;
  user_id: string;
  name: string;
  status: 'creating' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  progress?: number;
  // Optional fields that may come from Berget.ai
  heygen_avatar_id?: string | null;
  thumbnail_url?: string | null;
  preview_video_url?: string | null;
}
