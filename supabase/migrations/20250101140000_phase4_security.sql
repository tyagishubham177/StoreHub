-- Harden read access for inventory tables to enforce view-only access for public users

-- Admin membership should only be visible to the user and administrators
DROP POLICY IF EXISTS "Allow read access" ON public.admin_users;

CREATE POLICY "Users read their membership"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin read admin_users"
  ON public.admin_users
  FOR SELECT
  USING (public.is_admin());

-- Products are publicly readable only when active and not soft deleted
DROP POLICY IF EXISTS "Allow read access" ON public.products;

CREATE POLICY "Public read active products"
  ON public.products
  FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Admin read products"
  ON public.products
  FOR SELECT
  USING (public.is_admin());

-- Variants must be active, in stock, and belong to an active product for public reads
DROP POLICY IF EXISTS "Allow read access" ON public.product_variants;

CREATE POLICY "Public read active variants"
  ON public.product_variants
  FOR SELECT
  USING (
    is_active
    AND stock_qty > 0
    AND EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.status = 'active'
        AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "Admin read product_variants"
  ON public.product_variants
  FOR SELECT
  USING (public.is_admin());

-- Images require an active product and, if linked, an active in-stock variant
DROP POLICY IF EXISTS "Allow read access" ON public.product_images;

CREATE POLICY "Public read product images"
  ON public.product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.status = 'active'
        AND p.deleted_at IS NULL
    )
    AND (
      variant_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.product_variants pv
        WHERE pv.id = variant_id
          AND pv.is_active
          AND pv.stock_qty > 0
      )
    )
  );

CREATE POLICY "Admin read product_images"
  ON public.product_images
  FOR SELECT
  USING (public.is_admin());

-- Tag relationships respect product visibility
DROP POLICY IF EXISTS "Allow read access" ON public.product_tags;

CREATE POLICY "Public read product tags"
  ON public.product_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.status = 'active'
        AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "Admin read product_tags"
  ON public.product_tags
  FOR SELECT
  USING (public.is_admin());
