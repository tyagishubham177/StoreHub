-- Enable row-level security and apply taxonomy-style policies to product_types
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;

-- Ensure migrations are re-runnable by dropping existing policies if they exist
DROP POLICY IF EXISTS "Allow read access" ON public.product_types;
DROP POLICY IF EXISTS "Admin writes when enabled" ON public.product_types;

-- Unrestricted read access
CREATE POLICY "Allow read access"
  ON public.product_types
  FOR SELECT
  USING (true);

-- Admin gated writes that require writes_enabled flag to be true
CREATE POLICY "Admin writes when enabled"
  ON public.product_types
  FOR ALL
  USING (public.is_admin() AND public.writes_enabled())
  WITH CHECK (public.is_admin() AND public.writes_enabled());
