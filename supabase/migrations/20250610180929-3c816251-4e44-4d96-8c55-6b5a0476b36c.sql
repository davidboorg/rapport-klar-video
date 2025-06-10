
-- Add script_alternatives column to generated_content table
ALTER TABLE public.generated_content 
ADD COLUMN script_alternatives JSONB DEFAULT '[]'::jsonb;
