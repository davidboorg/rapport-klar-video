-- Expand storage policies to also allow projectId-prefixed paths
begin;

-- Documents bucket: allow access when first folder is a project owned by the user
DO $$ BEGIN
  CREATE POLICY "Users can read documents via project ownership"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload documents via project ownership"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update documents via project ownership"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete documents via project ownership"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- generated-audio bucket
DO $$ BEGIN
  CREATE POLICY "Users can read generated audio via project ownership"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-audio' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload generated audio via project ownership"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-audio' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update generated audio via project ownership"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'generated-audio' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete generated audio via project ownership"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'generated-audio' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- generated-videos bucket
DO $$ BEGIN
  CREATE POLICY "Users can read generated videos via project ownership"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-videos' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload generated videos via project ownership"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-videos' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update generated videos via project ownership"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'generated-videos' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete generated videos via project ownership"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'generated-videos' AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

commit;