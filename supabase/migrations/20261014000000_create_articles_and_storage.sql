-- Migración inicial: Tabla articles, índices, RLS y almacenamiento para EL LENTE TARIJEÑO

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabla de artículos
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK(char_length(title) BETWEEN 5 AND 180),
  slug TEXT NOT NULL UNIQUE CHECK(char_length(slug) BETWEEN 3 AND 120),
  summary TEXT NOT NULL CHECK(char_length(summary) BETWEEN 10 AND 400),
  content TEXT NOT NULL CHECK(char_length(content) >= 20),
  category TEXT NOT NULL DEFAULT 'Tarija',
  cover_image TEXT,
  author TEXT NOT NULL DEFAULT 'Redacción EL LENTE TARIJEÑO',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices de rendimiento
CREATE INDEX IF NOT EXISTS articles_status_published_idx ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON public.articles(slug);

-- 4. Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 4.1 Lectura pública de artículos publicados
DROP POLICY IF EXISTS "Public reads published articles" ON public.articles;
CREATE POLICY "Public reads published articles" 
ON public.articles 
FOR SELECT 
TO anon, authenticated 
USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

-- 4.2 Acceso editorial total para usuarios autenticados
DROP POLICY IF EXISTS "Authenticated editors read all articles" ON public.articles;
CREATE POLICY "Authenticated editors read all articles" 
ON public.articles 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated editors insert" ON public.articles;
CREATE POLICY "Authenticated editors insert" 
ON public.articles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated editors update" ON public.articles;
CREATE POLICY "Authenticated editors update" 
ON public.articles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated editors delete" ON public.articles;
CREATE POLICY "Authenticated editors delete" 
ON public.articles 
FOR DELETE 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- 5. Bucket de Supabase Storage para imágenes de artículos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  8388608, -- 8 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- 6. Políticas de Storage
DROP POLICY IF EXISTS "Public reads news images" ON storage.objects;
CREATE POLICY "Public reads news images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated upload news images" ON storage.objects;
CREATE POLICY "Authenticated upload news images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated update news images" ON storage.objects;
CREATE POLICY "Authenticated update news images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'article-images') 
WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated delete news images" ON storage.objects;
CREATE POLICY "Authenticated delete news images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'article-images');
