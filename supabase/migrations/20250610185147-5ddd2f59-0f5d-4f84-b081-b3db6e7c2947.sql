
-- Create enhanced project management tables
CREATE TABLE IF NOT EXISTS public.project_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('script', 'audio', 'video', 'thumbnail')),
  file_url TEXT,
  script_text TEXT,
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.processing_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add additional columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS report_type TEXT CHECK (report_type IN ('Q1', 'Q2', 'Q3', 'Q4', 'H1', 'Annual')),
ADD COLUMN IF NOT EXISTS fiscal_year INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_content_project_id ON public.project_content(project_id);
CREATE INDEX IF NOT EXISTS idx_processing_steps_project_id ON public.processing_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON public.project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);

-- Enable RLS on new tables
ALTER TABLE public.project_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_content
CREATE POLICY "Users can view their project content" 
  ON public.project_content 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_content.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their project content" 
  ON public.project_content 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_content.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project content" 
  ON public.project_content 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_content.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for processing_steps
CREATE POLICY "Users can view their processing steps" 
  ON public.processing_steps 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = processing_steps.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create processing steps" 
  ON public.processing_steps 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = processing_steps.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update processing steps" 
  ON public.processing_steps 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = processing_steps.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for project_analytics
CREATE POLICY "Users can view their project analytics" 
  ON public.project_analytics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_analytics.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create project analytics" 
  ON public.project_analytics 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_analytics.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project analytics" 
  ON public.project_analytics 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_analytics.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create triggers for updating timestamps
CREATE TRIGGER update_project_content_updated_at BEFORE UPDATE ON public.project_content 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at BEFORE UPDATE ON public.project_analytics 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
