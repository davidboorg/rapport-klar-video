
export interface Avatar {
  id: string;
  user_id: string;
  heygen_avatar_id: string | null;
  name: string;
  status: string;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  created_at: string;
  updated_at: string;
  progress?: number;
}
