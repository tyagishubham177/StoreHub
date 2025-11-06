-- Consolidate product image write access to rely on the shared admin helper
DROP POLICY IF EXISTS "Admin insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin delete product_images" ON public.product_images;

CREATE POLICY "Admin manage product_images"
  ON public.product_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
