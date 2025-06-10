
-- Create user_avatars table for storing avatar information
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  heygen_avatar_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'processing', 'completed', 'failed')),
  thumbnail_url TEXT,
  preview_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_profiles table for ElevenLabs integration
CREATE TABLE public.voice_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE CASCADE,
  elevenlabs_voice_id TEXT,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'sv-SE',
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'processing', 'completed', 'failed')),
  sample_audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create avatar_training_data table for uploaded content
CREATE TABLE public.avatar_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  avatar_id UUID NOT NULL REFERENCES public.user_avatars(id) ON DELETE CASCADE,
  video_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  processing_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')),
  quality_score INTEGER,
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create avatar_customizations table for avatar settings
CREATE TABLE public.avatar_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  avatar_id UUID NOT NULL REFERENCES public.user_avatars(id) ON DELETE CASCADE,
  attire JSONB DEFAULT '{}'::jsonb,
  background JSONB DEFAULT '{}'::jsonb,
  speaking_style JSONB DEFAULT '{}'::jsonb,
  brand_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_avatars
CREATE POLICY "Users can view their own avatars" 
  ON public.user_avatars 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatars" 
  ON public.user_avatars 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatars" 
  ON public.user_avatars 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatars" 
  ON public.user_avatars 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for voice_profiles
CREATE POLICY "Users can view their own voice profiles" 
  ON public.voice_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice profiles" 
  ON public.voice_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice profiles" 
  ON public.voice_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice profiles" 
  ON public.voice_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for avatar_training_data
CREATE POLICY "Users can view their avatar training data" 
  ON public.avatar_training_data 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_training_data.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their avatar training data" 
  ON public.avatar_training_data 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_training_data.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their avatar training data" 
  ON public.avatar_training_data 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_training_data.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their avatar training data" 
  ON public.avatar_training_data 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_training_data.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

-- RLS policies for avatar_customizations
CREATE POLICY "Users can view their avatar customizations" 
  ON public.avatar_customizations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_customizations.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their avatar customizations" 
  ON public.avatar_customizations 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_customizations.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their avatar customizations" 
  ON public.avatar_customizations 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_customizations.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their avatar customizations" 
  ON public.avatar_customizations 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.user_avatars 
    WHERE user_avatars.id = avatar_customizations.avatar_id 
    AND user_avatars.user_id = auth.uid()
  ));

-- Add trigger for updating updated_at timestamps
CREATE TRIGGER update_user_avatars_updated_at
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_profiles_updated_at
  BEFORE UPDATE ON public.voice_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avatar_customizations_updated_at
  BEFORE UPDATE ON public.avatar_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
