-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location TEXT,
    area_m2 NUMERIC,
    bedrooms INTEGER,
    bathrooms INTEGER,
    construction_time_months INTEGER,
    price_range JSONB,
    features TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_images table
CREATE TABLE public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    is_cover BOOLEAN DEFAULT false,
    image_type TEXT DEFAULT 'gallery',
    media_type TEXT DEFAULT 'image',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_finishes table
CREATE TABLE public.project_finishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_modifier NUMERIC DEFAULT 0,
    storage_path TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_terrains table
CREATE TABLE public.project_terrains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_modifier NUMERIC DEFAULT 0,
    storage_path TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_stages table
CREATE TABLE public.project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_month INTEGER NOT NULL,
    duration_months INTEGER NOT NULL,
    storage_path TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_config table
CREATE TABLE public.site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for projects (public read for published, admin write)
CREATE POLICY "Anyone can view published projects"
ON public.projects FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage projects"
ON public.projects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS policies for project_images
CREATE POLICY "Anyone can view images of published projects"
ON public.project_images FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_images.project_id 
    AND projects.is_published = true
));

CREATE POLICY "Admins can view all images"
ON public.project_images FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage images"
ON public.project_images FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS policies for project_finishes
CREATE POLICY "Anyone can view finishes of published projects"
ON public.project_finishes FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_finishes.project_id 
    AND projects.is_published = true
));

CREATE POLICY "Admins can view all finishes"
ON public.project_finishes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage finishes"
ON public.project_finishes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS policies for project_terrains
CREATE POLICY "Anyone can view terrains of published projects"
ON public.project_terrains FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_terrains.project_id 
    AND projects.is_published = true
));

CREATE POLICY "Admins can view all terrains"
ON public.project_terrains FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage terrains"
ON public.project_terrains FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS policies for project_stages
CREATE POLICY "Anyone can view stages of published projects"
ON public.project_stages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_stages.project_id 
    AND projects.is_published = true
));

CREATE POLICY "Admins can view all stages"
ON public.project_stages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage stages"
ON public.project_stages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS policies for site_config (public read, admin write)
CREATE POLICY "Anyone can view site config"
ON public.site_config FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site config"
ON public.site_config FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_published ON public.projects(is_published);
CREATE INDEX idx_projects_featured ON public.projects(is_featured);
CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX idx_project_finishes_project_id ON public.project_finishes(project_id);
CREATE INDEX idx_project_terrains_project_id ON public.project_terrains(project_id);
CREATE INDEX idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_site_config_key ON public.site_config(key);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_images_updated_at
    BEFORE UPDATE ON public.project_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_finishes_updated_at
    BEFORE UPDATE ON public.project_finishes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_terrains_updated_at
    BEFORE UPDATE ON public.project_terrains
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_stages_updated_at
    BEFORE UPDATE ON public.project_stages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON public.site_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);

-- Storage policies for project-images bucket
CREATE POLICY "Anyone can view project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));