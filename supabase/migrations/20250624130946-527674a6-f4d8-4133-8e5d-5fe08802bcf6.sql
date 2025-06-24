
-- Temporarily disable RLS on projects table for demo purposes
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on generated_content table to allow demo workflow
ALTER TABLE public.generated_content DISABLE ROW LEVEL SECURITY;
