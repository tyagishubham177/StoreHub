-- Ensure admins can manage product images without tripping writes_enabled gating
DROP POLICY IF EXISTS "Admin insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin update product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin delete product_images" ON public.product_images;

-- Shared check expression for admin membership
CREATE POLICY "Admin insert product_images"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin update product_images"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin delete product_images"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );
