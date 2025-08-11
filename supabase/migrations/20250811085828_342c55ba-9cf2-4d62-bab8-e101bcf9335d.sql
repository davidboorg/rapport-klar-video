-- Enable and enforce RLS on sensitive public tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Force RLS so all access goes through policies
ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content FORCE ROW LEVEL SECURITY;

-- Harden function search_path (linter recommendation)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;