-- ============================================================================
-- PHASE 1: Quote Requests Table with Structured Fields for HubSpot Integration
-- ============================================================================

-- Create quote_requests table with all structured fields
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Location
  location TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  
  -- Structured model/customization references (for HubSpot)
  project_id UUID,
  project_name TEXT,
  finish_id UUID,
  finish_name TEXT,
  terrain_id UUID,
  terrain_name TEXT,
  
  -- Pricing in selected currency
  currency TEXT NOT NULL DEFAULT 'usd',
  base_price NUMERIC DEFAULT 0,
  finish_modifier NUMERIC DEFAULT 0,
  terrain_modifier NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  
  -- Exchange rates snapshot at time of quote
  exchange_rates JSONB,
  
  -- Legacy fields (for backwards compatibility)
  model TEXT,
  notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Create indexes for common queries
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON public.quote_requests(created_at DESC);
CREATE INDEX idx_quote_requests_project_id ON public.quote_requests(project_id);
CREATE INDEX idx_quote_requests_email ON public.quote_requests(email);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users (admins) to view all quotes
CREATE POLICY "Authenticated users can view all quotes"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users (admins) to update quotes
CREATE POLICY "Authenticated users can update quotes"
ON public.quote_requests
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users (admins) to delete quotes
CREATE POLICY "Authenticated users can delete quotes"
ON public.quote_requests
FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_quote_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_quote_updated_at();