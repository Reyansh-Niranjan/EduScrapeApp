-- ==============================================================================
-- NovaSlate: NCERT Catalog PostgreSQL Schema
-- Replaces Supabase Storage with lean PostgreSQL metadata records.
-- Binary PDFs are hosted on Internet Archive (IAS3) with zero egress fees.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.catalog (
    id TEXT PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    book_code TEXT,
    url TEXT NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_catalog_class ON public.catalog(class);
CREATE INDEX IF NOT EXISTS idx_catalog_subject ON public.catalog(subject);
CREATE INDEX IF NOT EXISTS idx_catalog_is_available ON public.catalog(is_available);

-- Enable Row Level Security (RLS)
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated read policy (public catalog)
DROP POLICY IF EXISTS "Allow public read access to catalog" ON public.catalog;
CREATE POLICY "Allow public read access to catalog"
    ON public.catalog FOR SELECT
    USING (true);

-- Service role full access for scraper / replacer pipeline
DROP POLICY IF EXISTS "Allow service role full access to catalog" ON public.catalog;
CREATE POLICY "Allow service role full access to catalog"
    ON public.catalog FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
