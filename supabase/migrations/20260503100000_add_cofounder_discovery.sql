-- Add cofounder discovery fields to founder_pages table
ALTER TABLE public.founder_pages 
ADD COLUMN cofound_seeking boolean DEFAULT false,
ADD COLUMN cofound_roles text[] DEFAULT NULL,
ADD COLUMN cofound_stage text DEFAULT NULL,
ADD COLUMN cofound_focus_area text DEFAULT NULL,
ADD COLUMN cofound_location_pref text DEFAULT NULL,
ADD COLUMN cofound_updated_at timestamptz DEFAULT now();

-- Create index for faster cofounder search queries
CREATE INDEX idx_founder_pages_cofound_seeking ON public.founder_pages(cofound_seeking);
CREATE INDEX idx_founder_pages_cofound_stage ON public.founder_pages(cofound_stage);

-- No new RLS policies needed - founder_pages already allows public SELECT and auth INSERT/UPDATE
