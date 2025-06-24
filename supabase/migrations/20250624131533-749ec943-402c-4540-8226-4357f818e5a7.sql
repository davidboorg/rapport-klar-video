
-- Remove the foreign key constraint on user_id for demo purposes
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Make user_id nullable for demo purposes  
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;
