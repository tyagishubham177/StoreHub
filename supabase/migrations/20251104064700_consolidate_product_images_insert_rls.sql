-- Drop conflicting INSERT policies
DROP POLICY IF EXISTS "Admin insert product_images" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated users can add images" ON public.product_images;

-- Create a single, unified INSERT policy for admins
CREATE POLICY "Admins can insert product images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (public.is_admin() AND auth.uid() = created_by);
