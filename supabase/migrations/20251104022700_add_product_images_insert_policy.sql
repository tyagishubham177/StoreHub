CREATE POLICY "Admin insert product_images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (public.is_admin());
