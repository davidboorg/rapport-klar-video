-- Secure storage buckets and add missing DELETE policies
-- 1) Make 'documents' bucket private and create 'generated-audio' bucket (private)
-- 2) Add storage.objects policies for owner-scoped access
-- 3) Add DELETE policies on project_content, processing_steps, project_analytics

begin;

-- Ensure documents bucket is private
update storage.buckets set public = false where id = 'documents';

-- Create generated-audio bucket if not exists
insert into storage.buckets (id, name, public)
values ('generated-audio', 'generated-audio', false)
on conflict (id) do nothing;

-- Policies for storage.objects - documents bucket
DO $$ BEGIN
  CREATE POLICY "Users can read their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies for storage.objects - generated-audio bucket
DO $$ BEGIN
  CREATE POLICY "Users can read their own generated audio"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own generated audio"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own generated audio"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'generated-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own generated audio"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'generated-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies for storage.objects - generated-videos bucket
DO $$ BEGIN
  CREATE POLICY "Users can read their own generated videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own generated videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own generated videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'generated-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own generated videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'generated-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DELETE policies for app tables
DO $$ BEGIN
  CREATE POLICY "Users can delete their project content"
  ON public.project_content
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_content.project_id
      AND projects.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their processing steps"
  ON public.processing_steps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = processing_steps.project_id
      AND projects.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their project analytics"
  ON public.project_analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_analytics.project_id
      AND projects.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

commit;